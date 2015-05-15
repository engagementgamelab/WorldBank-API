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

      // grab the user model
      var User = require('../models/user');
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

          this.password = passwordHash;
          this.password_salt = passwordSalt;

        });

        // save the user
        newUser.save(function(err, user) {
          
          if (err) connection.response = err;
        
          console.log(cacheKey(user));
          
          api.cache.save(cacheKey(user), newUser, function(error){
            connection.error = error;
            connection.response.userCreated = true;
          });

        });

        console.log(newUser);
    
        next(connection, true);
      
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

  run: function(api, connection, next){

    var dataInput = connection.rawConnection.params.body;

    connection.response.auth = false;
    console.log(cacheKey(connection))
    
    api.cache.load(cacheKey(connection), function(err, user){
      if(err){
        connection.error = err;
        next(connection, true);
      }else if(user == null){
        connection.error = "User not found";
        next(connection, true);
      }
      else{
        var passwordHash = caluculatePassowrdHash(dataInput.password, user.passwordSalt);
        
        if(passwordHash !== user.passwordHash){
          connection.error = "incorrect password";
          next(connection, true);
        }else{
          api.session.generateAtLogin(connection, function(){
            connection.response.auth = true;
            next(connection, true);
          });
        }
      }
    });
  }
};