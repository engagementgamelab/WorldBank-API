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

/**
* @method userCreate
* @attribute POST
* @type {form-data} form containing all required 
* @required
* @return {Object} Empty if successful (200).
* @throws {Object} Returns error if missing required field(s) or invalid data.
*/
exports.action = {

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

      // grab the user model
      var User = require('../models/user');
      var dataInput = connection.rawConnection.params.body;

      // create a new user
      var newUser = User(
        dataInput
      );

      // on every save, add the date
      newUser.pre('save', function(next) {
        // get the current date
        var currentDate = new Date();
        
        this.last_accessed = currentDate;
        this.created_at = currentDate;

        next();
      });

      // save the user
      newUser.save(function(err) {
        if (err) connection.response = err;
      });
        
      next(connection, true);

    }
};