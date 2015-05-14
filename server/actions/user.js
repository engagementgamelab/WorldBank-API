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

/**
* @method userSave
* @attribute POST
* @type {form-data} form containing all required 
* @required
* @return {Object} Empty if successful (200).
* @throws {Object} Returns error if missing required field(s) or invalid data.
*/
exports.save = {

    name: 'userSave',
    description: 'Save a user.',
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

exports.authenticate=
{
  name: "userAuth",
  description: "Just a simple demo github login - callback action",
  
  run:function(api, connection, next)
  {
    api.log("ah-passport-plugin: local callback action running", "debug");

    // api.AHPassportPlugin.authenticate('local', {}),
    //   connection.response = "success";
    //   next(connection, true);

    api.AHPassportPlugin.authenticate("local", { successRedirect: '/api/gameData', failureRedirect: '/api/ah-passport-plugin/github/authenticate' }, function (err, user, info)
    {
      if(err)
      {
        api.log("ah-passport-plugin: Github authenticate action error %s", "debug", err);
        connection.error=err;
      }
      else if(typeof(user)!=="object" || !user)
      {
        api.log("ah-passport-plugin: Github authenticate action - Error: 'user' is not an object", "debug");
        connection.rawConnection.responseHttpCode=401; // Unauthorized
        connection.error = info;
      }
      else 
      {
        connection.rawConnection.req.logIn(user, function (){

          // This may well need amending
          user.uid=connection.id;
          api.log("ah-passport-plugin: Github authenticate action - login done!", "debug");
        
        });
      }

      next(connection, true);
    
    })(connection.rawConnection.req, connection.rawConnection.res);
  }
};