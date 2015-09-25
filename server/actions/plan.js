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

        var queryDone = _.after(4, randomResponse);
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

        getPlanWithFilter({'pbc': true, 'autonomy': true});
        getPlanWithFilter({'pbc': true, 'autonomy': false});
        getPlanWithFilter({'pbc': false, 'autonomy': true});
        getPlanWithFilter({'pbc': false, 'autonomy': false});

        function randomResponse() {

/*            api.mongo.user.findById(dataInput.user_id, function (err, user) {
                // Database error
                if(err) {
                    data.response.error = err;

                    next();
                }
                // User not found
                else if(user == null) {
                    data.response.error = "The user with the specified id was not found.";

                    next();
                };

                api.mongo.plan.findById(user.plan_id, function (err, userPlan) {

                    arrPlanOutput.splice(1, 0, userPlan);

                    
                });
            
            });*/

            data.response = {plans: JSON.stringify(arrPlanOutput)};
            next();


        }


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

      api.mongo.plan.findOne(dataInput.plan_id, function(err, plan) {

        // plan

        data.response = planIDs;
            
        next();

      });

    }

};