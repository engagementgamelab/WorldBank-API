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

var getPasswordHash = function(password, salt){
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

    inputs: {
      required: ["username", "password", "email", "location"]
    },

    /* GET game data. */
    run: function (api, connection, next) {

      var dataInput = connection.rawConnection.params.body;

      // Find count of users with this email (error if not zero)
      api.mongo.user.count({ 'email': dataInput.email }, function(err, userCount) {

        if(userCount === 0) {

          // Find count of users with this username (error if not zero)
          api.mongo.user.count({ 'username': dataInput.username }, function(err, usernameCount) {

            if(usernameCount === 0) {

              if(dataInput.password.length < 6)
              {
                connection.error = "Password must be longer than 6 characters.";
                next(connection, true);
              }
              else
              {
                // Generate password salt and hash
                var passwordSalt = api.utils.randomString(64);
                var passwordHash = getPasswordHash(dataInput.password, passwordSalt);

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
                    connection.error = err;

                  api.session.generateAtLogin(connection, function(){

                    connection.response.auth = true;
                    connection.response.user = newUser;

                    next(connection, true);

                  });
                
                });
              
              }

            }
            else
            {
              connection.error = "A user with the specified username already exists.";
              next(connection, true);
            }

          });

        }
        else
        {
          connection.error = "A user with the specified email already exists.";
          next(connection, true);
        }

      });

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

            planScore -= scoreReduction;

            optionIndex++;

          });

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

      // Database error
      if(err) {
        connection.error = err;

        next(connection, true);
      }
      // User not found
      else if(user == null) {
        connection.error = "The user with the specified email was not found.";

        next(connection, true);
      }
      // User was found
      else {
        // Check password
        var passwordHash = getPasswordHash(dataInput.password, user.password_salt);

        if(passwordHash !== user.password) {

          connection.error = "Incorrect Password.";
          next(connection, true);

        } 
        else {

          api.session.generateAtLogin(connection, function() {

            user.save();

            var userRecord = user.toObject();

            delete userRecord.last_accessed;
            delete userRecord.password;
            delete userRecord.password_salt;

            connection.response.auth = true;
            connection.response.user = userRecord;

            api.trackEvent(user._id, "User Login", "API", function(error) {

              if(err !== undefined)
                connection.error = error;

              next(connection, true);

            });

          });

        }
      }
    
    });

  }

};