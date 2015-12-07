/* 
World Bank API
Created by Engagement Lab, 2015
==============
 auth.js
 Game Auth (currently via key)

 Created by Johnny Richardson on 4/2/15.
==============
*/

/**
  Defines API-level authentication.
  @class auth
  @namespace actions
  @constructor
  @requires 
  @static
**/

/**
* Authenticate the client.
* @method apiAuth
* @param key {String} The unique server token the client uses to identify credentials.
* @requires api.config.serverToken
* @return {Object} Session cookie and authed response (200).
* @throws {Object} Returns error if missing required field(s) or incorrect token.
*/
exports.apiAuth = {
  name: "apiAuth",
  description: "auth",
  inputs: {
      required: ["key"]
  },
  blockedConnectionTypes: [],
  outputExample: {},
  run: function(api, data, next) {

    var dataInput = data.connection.rawConnection.params.body;

    data.response.authed = false;

    if (dataInput.key == undefined) {
      data.response.error = "no key specified";
      next();
    }
    else if (api.config.general.serverToken != dataInput.key) {
      data.response.error = "incorrect server token";
      next();
    }
    else {
        api.session.generateAuth(
          data.connection,
          function() {
            data.response.authed = true;
            data.response.session_cookie = data.connection.fingerprint;
            next();
          }, 
          'client'
        );
      }
  }

};