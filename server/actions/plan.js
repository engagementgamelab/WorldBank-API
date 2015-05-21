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

/**
* @class plan
**/

/**
* @method getAll
* @attribute POST
* @type {form-data} form containing all required 
* @required
* @return {Object} All plan IDs if successful (200).
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

    inputs: {},

    /* GET all plan IDs. */
    run: function (api, connection, next) {

      api.mongo.plan.find({}, function(err, plans) {
        
        var planIDs = [];

        plans.forEach(function(plan) {
          planIDs.push(plan._id);
        });

        connection.response = planIDs;
            
        next(connection, true);

      });

    }

};