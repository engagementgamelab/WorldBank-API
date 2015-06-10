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
        var planInput = dataInput.plan;

        var unlockablesConfig = api.readYaml("unlockables.yml");
        var gradingConfig = api.readYaml("grading.yml");
        var planKeysConfig = api.gameConfig.content.plan.scoring_keys;

        var gradeInfo = null;

        // Score the plan
        var planGrade = function(inputTactics) {

          var planScore = 14;
          var optionIndex = 0;

          _.each(inputTactics, function (tactic_symbol) {

            // Get the priority of this tactic
            var tacticPriority = unlockablesConfig.filter(function(unlockable) {
                return unlockable.symbol == tactic_symbol;
            })[0].priority;

            // Get the grading info for the plan score
            gradeInfo = gradingConfig.filter(function(grade) {
                return grade.score.indexOf(planScore) !== -1;
            })[0];

            // If no priority, default to 0
            if(tacticPriority === undefined)
              tacticPriority = 0;

            // Calculate reduction for total score
            var scoreReduction = Math.abs(tacticPriority - planKeysConfig[optionIndex]);

            // console.log(tacticPriority + " - " + planKeysConfig[optionIndex])
            // console.log(Math.abs(tacticPriority - planKeysConfig[optionIndex]))

            planScore -= scoreReduction;

            optionIndex++;

          });

          // console.log("planScore: " + planScore);

          // Output the score and plan info
          return { score: planScore, grade_info: gradeInfo };

        }

        // Calculate the plan's score ("grade")
        var finalPlanGrade = planGrade(planInput.tactics);
        planInput.score = finalPlanGrade.score;

        // Create a plan object to update inside user
        var planModel = new api.mongo.plan( 
          planInput
        );
         
        // Find specified user
        api.mongo.user.findOne(dataInput.user_id, function (err, user) {
      
            if(user == null) {
              connection.response.error = "User not found";
              next(connection, true);
            }

            // Save the plan
            planModel.save(function(err) {

              if (err) connection.response.error = err;

              // Associate this plan w/ the uer
              user.plan_id = planModel._id;

              user.save(function (err, updatedUser) {
                
                if (err) connection.response.error = err;

              });

              // Output grading info
              connection.response.score = finalPlanGrade.score;
              connection.response.grade = finalPlanGrade.grade_info.grade;
              connection.response.description = finalPlanGrade.grade_info.description;
                  
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

      var assignUserScenario = function(plan) {

        // Obtain scenario filtering flags and the scenario assignment matrix
        var scenarioFilters = api.gameConfig.content.plan.scenario_filters;
        var phaseTwoMatrix = api.gameConfig.content.plan.assignment_matrix;

        // Determine which filtering flags the plan meets
        var hasPbc = plan.tactics.indexOf(scenarioFilters.pbc) !== -1;
        var hasAutonomy = plan.tactics.indexOf(scenarioFilters.autonomy) !== -1;

        // Assignment of scenario via matrix
        var scenarioName = phaseTwoMatrix["pbc_" + hasPbc]["autonomy_" + hasAutonomy];

        return scenarioName;

      }

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
              connection.response.tactics = plan.tactics;

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