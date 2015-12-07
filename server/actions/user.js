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
  Contains all user-related endpoints.
  @class user
  @namespace actions
  @constructor
  @static
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
* Create a new user.
* @method userCreate
* @param first_name {String} User's first name
* @param last_name {String} User's last name
* @param email {String} User's email
* 
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
      required: ["first_name", "last_name", "email"]
    },

    /* GET game data. */
    run: function (api, data, next) {

      var dataInput = data.connection.rawConnection.params.body;

      // Find count of users with this email (error if not zero)
      api.mongo.user.count({ 'email': dataInput.email }, function(err, userCount) {

        if(userCount === 0) {
    
          // Concat name
          dataInput.name = dataInput.first_name + " " + dataInput.last_name;

          // Date
          dataInput.created_at = new Date();

          delete dataInput.first_name;
          delete dataInput.last_name;

          // create a new user
          var newUser = new api.mongo.user(
            dataInput
          );

          // save the user
          newUser.save(function(err) {
            
            if (err) 
              data.response.error = "Mongo error: " + err;

            api.session.generateAuth(data.connection, function(){

              data.response.auth = true;
              data.response.user = newUser;

              next();

            });
          
          });
            
        }
        else
        {
          data.response.error = "A user with the specified email already exists.";
          next();
        }

      });

    }
};

/**
* Save the user's state.
* @method userSave
* @param user_id {String} User's ID
* @param save_plan {Boolean} True if saving user's "plan"
*   @param plan {Object} Input data containing the plan; must be included when using save_plan
* @param save_phase_2 {Boolean} True if setting user's phase two state to finished.
* 
* @return {Object} User's plan grade if save_plan used, or 'phase_two_done' confirmation if save_phase_2 used.
* @throws {Object} Returns error if missing required field(s), invalid data, or database exception.
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
    requiresUserLogin: true,

    inputs:  {
      required: ["user_id"],
      optional: ["plan", "save_plan", "save_phase_2"]
    },

    /* GET game data. */
    run: function (api, data, next) {

      var dataInput = data.connection.rawConnection.params.body;
      var planInput = dataInput.plan;

      if(dataInput.save_plan !== undefined && dataInput.save_phase_2 !== undefined)
      {
        data.response.error = "Cannot save both plan and phase two state simultaneosly!";
        next();
        return;
      }


      // Saving plan?
      if(dataInput.save_plan !== undefined) {

        var unlockablesConfig = api.readYaml("unlockables.yml");
        var gradingConfig = api.readYaml("grading.yml");
        var planKeysConfig = api.gameConfig.content.plan.scoring_keys;

        // Obtain scenario filtering flags 
        var scenarioFilters = api.gameConfig.content.plan.scenario_filters;

        var gradeInfo = null;

        if(planInput.tactics.length !== 6) {
          data.response.error = "Incorrect number of tactics received.";
          next();
          return;
        }

        // Score the plan
        var planGrade = function(inputTactics) {

          var planScore = 14;
          var optionIndex = 0;

          _.each(inputTactics, function (tactic_symbol) {

            // Get the priority of this tactic
            var tacticPriority = unlockablesConfig.filter(function(unlockable) {
                return unlockable.symbol == tactic_symbol;
            })[0].priority;

            // If no priority, default to 0
            if(tacticPriority === undefined)
              tacticPriority = 0;

            // Calculate reduction for total score
            var scoreReduction = Math.abs(tacticPriority - planKeysConfig[optionIndex]);

            planScore -= scoreReduction;

            optionIndex++;

          });

          // Get the grading info for the plan score
          gradeInfo = gradingConfig.filter(function(grade) {

              // Scores in grading YML defined as range "x-x"
              var scoreRange = grade.score.split('-');
              
              var scoreUnderMax = planScore <= scoreRange[0];
              var scoreAboveMin = planScore >= scoreRange[1];

              // Score is within range of grading block?
              return scoreAboveMin && scoreUnderMax;

          })[0];

          // Grade info not found for the score determined
          if(gradeInfo === undefined){
            data.response.error = "No grading info found for plan score: " + planScore + ". Something may be amiss in grading.yml";
            next();
            return;
          }

          // Determine which filtering flags the plan meets
          var hasPbc = planInput.tactics.indexOf(scenarioFilters.pbc) !== -1;
          var hasAutonomy = planInput.tactics.indexOf(scenarioFilters.autonomy) !== -1;

          // Output the score and plan info
          return { score: planScore, grade_info: gradeInfo, pbc: hasPbc, autonomy: hasAutonomy  };
        }

        // Calculate the plan's score ("grade")
        var finalPlanGrade = planGrade(planInput.tactics);
        planInput.grade = finalPlanGrade.grade_info.grade;
        planInput.default_affects = finalPlanGrade.grade_info.default_affects;
        planInput.affects_bias = finalPlanGrade.grade_info.affects_bias;
        planInput.pbc = finalPlanGrade.pbc;
        planInput.autonomy = finalPlanGrade.autonomy;

        planInput.created_at = new Date();

        // Create a plan object to update inside user
        var planModel = new api.mongo.plan( 
          planInput
        );

        // Find specified user
        api.mongo.user.findOne({_id: dataInput.user_id}, function (err, user) {

          if(user == null) {
            data.response.error = "User not found";
            next();
          }

          // Save the plan
          planModel.save(function(err, updatedPlan) {

            if (err) {
              data.response.error = err;
              next();
              return;
            }

            user.plan_id = planModel._id;
            user.submitted_plan = true;

            user.save(function (err, updatedUser) {
              
              if (err) {
                data.response.error = err;
                next();
                return;
              }

            });

            // Output grading info
            data.response.score = finalPlanGrade.score;
            data.response.grade = finalPlanGrade.grade_info.grade;
            data.response.indicators = finalPlanGrade.grade_info.default_affects;
            data.response.goal = api.gameConfig.content.plan.end_score;
            data.response.description = finalPlanGrade.grade_info.description;
                
            next();

          });

        });

      }

      // Updating phase 2 status?
      else if(dataInput.save_phase_2 !== undefined) {
           
        api.mongo.user.findById(dataInput.user_id, function (err, user) {
      
          if(user == null) {
            data.response.error = "User not found";
            next();
          }

          // Save phase two tutorial status
          user.phase_two_done = true;

          user.save(function (err, updatedUser) {
            
            if (err) data.response.error = "Mongo error: " + err;

          });

          data.response.phase_two_done = true;
                
          next();

        });

      }
    
    }

};

/**
* Assign the user's phase two scenario.
* @method userAssignScenario
* @param user_id {String} User's ID
* @param plan_id {String} Plan ID the user selected
* 
* @return {Object} Response containing current_scenario, tactics, default_affects, affects_goal.
* @throws {Object} Returns error if missing required field(s), invalid data, or database exception.
*/
exports.scenario = 
{

    name: 'userAssignScenario',
    description: 'Assign a scenario to user.',
    blockedConnectionTypes: [],
    outputExample: {},
    matchExtensionMimeType: false,
    version: 1.0,
    toDocument: true,
    requiresAuth: true,
    requiresUserLogin: true,

    inputs:  {
      required: ["user_id", "plan_id"]
    },

    run: function (api, data, next) {

      var dataInput = data.connection.rawConnection.params.body;

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
         
      api.mongo.user.findById(dataInput.user_id, function (err, user) {
    
          if(user == null) {
            data.response.error = "User not found";
            next();
          }

          api.mongo.plan.findById(dataInput.plan_id, function (err, plan) {

            if (err) data.response.error = err;

            data.response.current_scenario = user.current_scenario = assignUserScenario(plan);
            data.response.tactics = plan.tactics;
            data.response.default_affects = plan.default_affects;
            data.response.affects_goal = api.gameConfig.content.plan.end_score;

            user.save(function (err, updatedUser) {
              
              if (err) data.response.error = err;

            });
                
            next();

          });

      });

    }

};

/**
* Authenticate a user and obtain user data if successful.
* @method userAuth
* @param email {String} User's email.
* @param password {String} User's password (optional). This is not used currently as we do not store sensitive data.
* 
* @return {Object} Response containg user's id, username, submitted_plan, phase_two_done, plan_id fields
* @throws {Object} Returns error if missing required field(s), invalid data, or database exception.
*/
exports.auth =
{
  name: "userAuth",
  description: "auth",
  
  inputs: {
    "required" : ["email"],
    "optional" : ["password"]
  },
  
  blockedConnectionTypes: [],
  outputExample: {},

  run: function(api, data, next) {

    var dataInput = data.connection.rawConnection.params.body;

    data.response.auth = false;

    api.mongo.user.findOne({ 'email': dataInput.email.toLowerCase() }, '_id username submitted_plan phase_two_done plan_id', function (err, user) {

      // Database error
      if(err) {
        data.response.error = err;

        next();
      }
      // User not found
      else if(user == null) {
        data.response.error = "Sorry, that email address was not recognized. Have you registered?";

        next();
      }
      // User was found
      else {
        // Check password (not used right now)
        /* var passwordHash = getPasswordHash(dataInput.password, user.password_salt);

        if(passwordHash !== user.password) {

          data.response.error = "Incorrect Password.";
          next();

        } 
        else {
        */

          api.log("User '" + dataInput.email.toLowerCase() + "' found.", "notice");

          api.session.generateAuth(data.connection, function() {

            user.save();

            var userRecord = user.toObject();

            delete userRecord.last_accessed;
            delete userRecord.password;
            delete userRecord.password_salt;

            data.response.auth = true;
            data.response.user = userRecord;
            data.response.user_cookie = data.connection.fingerprint;

            api.log("User '" + dataInput.email.toLowerCase() + "' logged in.", "notice");

            api.trackEvent(user._id, "User Login", "API", function(error) {

              if(error !== undefined && error !== null)
                data.response.error = error;

              next();

            });

          });

        //}
      }
    
    });

  }

};