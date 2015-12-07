/* 
World Bank API
Created by Engagement Lab, 2015
==============
 analytics.js
 All analytics-related transactions.

 Created by Johnny Richardson on 6/29/15.
==============
*/
"use strict";

/**
    Handles all server-side analytics calls.
    @class analytics
    @namespace actions
    @constructor
    @static
**/

/**
    * Record a custom analytics event.
    * @method event
    * @param userId {String} The ID of the logged in user.
    * @required

    * @return {Object} Success reponse (200).
    * @throws {Object} Returns error if missing required field(s) or invalid data.
*/
exports.event = 
{

    name: 'analyticsEvent',
    description: 'Tracks the specified analytics event.',
    blockedConnectionTypes: [],
    outputExample: {},
    matchExtensionMimeType: false,
    version: 1.0,
    toDocument: true,

    inputs: {

        userId: {required: true},
        eventName: {required: true},
        eventCategory: {required: true}
        
    },

    /* Send analytic event to GA. */
    run: function (api, data, next) {

        var dataInput = data.connection.rawConnection.params.body;

        api.trackEvent(dataInput.userId, dataInput.eventName, dataInput.eventCategory);

        next();

    }

};