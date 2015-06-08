/* 
World Bank API
Created by Engagement Lab, 2015
==============
 user.js
 All user-related transactions.

 Created by Johnny Richardson on 4/10/15.
==============
*/
"use strict";

/**
* @class userCreate
**/

var crypto = require('crypto');
var fs = require('fs');
var YAML = require('yamljs');
var _ = require('underscore');
var redisPrefix = "__users-";

var caluculatePassowrdHash = function(password, salt){
  return crypto.createHash('sha256').update(salt + password).digest("hex");
}
var cacheKey = function(user){
  return redisPrefix + "id__" + user.id;
}

var assignUserScenario = function(plan) {

  var matrixContent = fs.readFileSync("../content/phase_two_matrix.yml", "utf8");
  var phaseTwoMatrix = YAML.parse(matrixContent);
  var scenario = phaseTwoMatrix["pbc_" + plan.pbc]["autonomy_" + plan.autonomy];

  console.log(scenario);

  return scenario;

}

/**
* @method userCreate
* @attribute POST
* @type {form-data} form containing all required 
* @required
* @return {Object} Empty if successful (200).
* @throws {Object} Returns error if missing required field(s) or invalid data.
*/
exports.create = {

    name: 'userCreate',
    description: 'Create a user.',
    blockedConnectionTypes: [],
    outputExample: {},
    matchExtensionMimeType: false,
    version: 1.0,
    toDocument: true,

    inputs: [],

    /* GET game data. */
    run: function (api, connection, next) {

      var dataInput = connection.rawConnection.params.body;

      if(dataInput.password.length < 6)
      {
        connection.error = "password must be longer than 6 chars";
        next(connection, true)
      }
      else
      {
        var passwordSalt = api.utils.randomString(64);
        var passwordHash = caluculatePassowrdHash(dataInput.password, passwordSalt);

        dataInput.created_at = new Date();
        dataInput.password = passwordHash;
        dataInput.password_salt = passwordSalt;

        // create a new user
        var newUser = new api.mongo.user(
          dataInput
        );

        // save the user
        newUser.save(function(err) {
          
          if (err) 
            connection.response = err;

          console.log(newUser);
    
          next(connection, true);
        
        });
      
      }
        

    }
};

/**
* @method userSave
* @attribute POST
* @type {form-data} form containing all required 
* @required
* @return {Object} Empty if successful (200).
* @throws {Object} Returns error if missing required field(s) or invalid data.
*/
exports.save = 
{

    name: 'userSave',
    description: 'Save a user.',
    blockedConnectionTypes: [],
    outputExample: {},
    matchExtensionMimeType: false,
    version: 1.0,
    toDocument: true,

    inputs:  {
      required: ["user_id", "plan"]
    },

    /* GET game data. */
    run: function (api, connection, next) {

      api.session.checkAuth(connection, function(session) {

        var dataInput = connection.rawConnection.params.body;
        var planInput = JSON.parse(dataInput.plan);
        var unlockablesConfig = api.readYaml("unlockables.yml");

        var planGrade = function(inputTactics) {

              var planScore = 14;

              // TODO Math.abs(a - b)
              // Get priority?
              _.each(inputTactics, function (tactic_symbol) {

                var tacticPriority = unlockablesConfig.filter(function(unlockable) {
                    return unlockable.symbol == tactic_symbol;
                })[0].priority;

                console.log('tacticPriority: ' + tacticPriority)

              });



        }

        planInput.score = planGrade(planInput.tactics);

        // Create a plan object to update inside user
        var planModel = new api.mongo.plan( 
          planInput
        );
         
        api.mongo.user.findOne(dataInput.user_id, function (err, user) {
      
            if(user == null) {
              connection.response.error = "User not found";
              next(connection, true);
            }

            api.mongo.plan.update({_id: planModel._id}, planModel.toObject(), {upsert: true}, function (err, plan) {

              if (err) connection.response.error = err;

              user.plan_id = plan._id;

              user.save(function (err, updatedUser) {
                
                if (err) connection.response.error = err;

              });
                  
              next(connection, true);

            });

        });

    }
    , next);

    }

};

/**
* @method plan
* @attribute POST
* @type {form-data} form containing all required 
* @required
* @return {Object} Empty if successful (200).
* @throws {Object} Returns error if missing required field(s) or invalid data.
*/
exports.scenario = 
{

    name: 'userAssignScenario',
    description: 'Save a user.',
    blockedConnectionTypes: [],
    outputExample: {},
    matchExtensionMimeType: false,
    version: 1.0,
    toDocument: true,

    inputs:  {
      required: ["user_id", "plan_id"]
    },

    /* GET game data. */
    run: function (api, connection, next) {

      api.session.checkAuth(connection, function(session) {

        var dataInput = connection.rawConnection.params.body;
         
        api.mongo.user.findOne(dataInput.user_id, function (err, user) {
      
            if(user == null) {
              connection.response.error = "User not found";
              next(connection, true);
            }

            api.mongo.plan.findOne(dataInput.plan_id, function (err, plan) {

              if (err) connection.response.error = err;

              user.plan_id = plan._id;
              connection.response.current_scenario = user.current_scenario = assignUserScenario(plan);

              user.save(function (err, updatedUser) {
                
                if (err) connection.response.error = err;

              });
                  
              next(connection, true);

            });

        });

    }
    , next);

    }

};

exports.auth =
{
  name: "userAuth",
  description: "auth",
  
  inputs: {
    "required" : ["email", "password"],
    "optional" : []
  },
  
  blockedConnectionTypes: [],
  outputExample: {},

  run: function(api, connection, next) {

    var dataInput = connection.rawConnection.params.body;

    connection.response.auth = false;

    api.mongo.user.findOne({ 'email': dataInput.email }, '_id username password password_salt plan_id', function (err, user) {

      if(err) {
        connection.error = err;
        console.log(err);
        next(connection, true);
      }
      else if(user == null) {
        connection.error = "User not found";
        console.log(connection.error);
        next(connection, true);
      }
      else {
        var passwordHash = caluculatePassowrdHash(dataInput.password, user.password_salt);

        if(passwordHash !== user.password){
          connection.error = "incorrect password";
          next(connection, true);
        }else{
          api.session.generateAtLogin(connection, function(){

            user.save();

            var userRecord = user.toObject();

            delete userRecord.last_accessed;
            delete userRecord.password;
            delete userRecord.password_salt;

            connection.response.auth = true;
            connection.response.user = userRecord;

            next(connection, true);

          });
        }
      }
    
    });

  }

};