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
            connection.response = err;

          console.log(newUser);
    
        next(connection, true);
        
        });
      
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
      required: ["user_id", "unlocks"]
    },

    /* GET game data. */
    run: function (api, connection, next) {

      api.session.checkAuth(connection, function(session) {

        var dataInput = connection.rawConnection.params.body;

        // Create a plan object to update inside user
        var planModel = new api.mongo.plan({
          unlocks: dataInput.unlocks
        });
         
        api.mongo.user.findByIdAndUpdate(dataInput.user_id, { $set: { plan: planModel }}, function (err, user) {
          if (err) connection.response.error = err;
          
          next(connection, true);
        });

      });

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

    api.mongo.user.findOne({ 'email': dataInput.email }, 'plan _id username password password_salt', function (err, user) {

      if(err) {
        connection.error = err;
        console.log(err);
        next(connection, true);
      }
      else if(user == null) {
        connection.error = "User not found";
        console.log(connection.error);
        next(connection, true);
      }
      else {
        var passwordHash = caluculatePassowrdHash(dataInput.password, user.password_salt);

        if(passwordHash !== user.password){
          connection.error = "incorrect password";
          next(connection, true);
        }else{
          api.session.generateAtLogin(connection, function(){

            user.save();

            var userRecord = user.toObject();

            delete userRecord.last_accessed;
            delete userRecord.password;
            delete userRecord.password_salt;

            connection.response.auth = true;
            connection.response.user = userRecord;

            next(connection, true);

          });
        }
      }
    
    });

  }

};