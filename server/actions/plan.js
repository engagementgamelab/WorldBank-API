/* 
World Bank API
Created by Engagement Lab, 2015
==============
 plan.js
 All plan-related transactions.

 Created by Johnny Richardson on 5/21/15.
==============
*/
"use strict";

var _ = require('underscore');

/**
* @class plan
**/

/**
* @method getAll
* @attribute POST
* @required
* @return {Object} Plan for each scenario type and player's last plan if successful (200).
* @throws {Object} Returns error if missing required field(s) or invalid data.
*/
exports.getAll = 
{

    name: 'allPlans',
    description: 'Get all current plans.',
    blockedConnectionTypes: [],
    outputExample: {},
    matchExtensionMimeType: false,
    version: 1.0,
    toDocument: true,
    // requiresAuth: true,

    inputs:  {
      required: ["user_id"]
    },

    run: function (api, data, next) {
        var arrPlanOutput = [];

        var queryDone = _.after(4, getUserPlan);
        var recordLimit = {limit: 1};

        var dataInput = data.connection.rawConnection.params.body;

        function getPlanWithFilter(filter) {

          api.mongo.plan.findRandom(filter, {},  recordLimit, function(err, planResult) {
            
            if (err) {
                data.response.error = "Mongo error: " + err;
                next();
            }

            arrPlanOutput.push(planResult[0]);

            queryDone();

          });

        }

        function getUserPlan() {

            // Lookup user requested to get their current plan
            api.mongo.user.findById(dataInput.user_id, function (err, user) {
                // Database error
                if(err) {
                    data.response.error = "Mongo error: " + err;

                    next();
                }
                // User not found
                else if(user == null) {
                    data.response.error = "The user with the specified id was not found.";

                    next();
                };

                // Find user's plan
                api.mongo.plan.findById(user.plan_id, function (err, userPlan) {
                    // Database error
                    if(err) {
                        data.response.error = "Mongo error: " + err;

                        next();
                    }

                    // Put plan at front of output array
                    arrPlanOutput.splice(0, 0, userPlan);

                    // Send plans
                    data.response = {plans: JSON.stringify(arrPlanOutput)};
                    next();
                  
                });
            
            });
        }

        getPlanWithFilter({'pbc': true, 'autonomy': true});
        getPlanWithFilter({'pbc': true, 'autonomy': false});
        getPlanWithFilter({'pbc': false, 'autonomy': true});
        getPlanWithFilter({'pbc': false, 'autonomy': false}); 

    }

};

/**
* @method save
* @attribute POST
* @required
* @return {Object}
* @throws {Object} Returns error if missing required field(s) or invalid data.
*/
exports.save = 
{

    name: 'save',
    description: 'Saves the specified plan.',
    blockedConnectionTypes: [],
    outputExample: {},
    matchExtensionMimeType: false,
    version: 1.0,
    toDocument: true,

    inputs: {},

    /* GET all plan IDs. */
    run: function (api, data, next) {

      var dataInput = data.connection.rawConnection.params.body;

      api.mongo.plan.findOne({_id: dataInput.plan_id}, function(err, plan) {

        // plan

        data.response = planIDs;
            
        next();

      });

    }

};