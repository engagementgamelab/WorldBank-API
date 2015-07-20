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
    run: function (api, data, next) {

      api.mongo.plan.find({}, function(err, plans) {
        
        var planIDs = [];

        plans.forEach(function(plan) {
          planIDs.push({id: plan._id, name: plan.name});
        });

        data.response = planIDs;
            
        next();

      });

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