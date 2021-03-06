/* 
World Bank API
Created by Engagement Lab, 2015
==============
 auth.middleware.js
 API authenication middleware initializer.

 Created by Johnny Richardson on 8/9/15.
==============
*/
"use strict";

/**
 *
 * Defines authentication middleware.
 * If an action uses 'requiresAuth' in template, this middleware first checks if the client has authenticated.
 * Or, if an action uses 'requiresUserLogin' in template, checks if the user has authenticated.
 * @namespace initializers
 * @class auth.middleware
 * @constructor
 * @static
 **/
module.exports = {

  initialize: function(api, next) {

    // Definition for the API client auth middleware
    var apiAuthMiddleware = {
      name: 'API authenication middleware.',
      global: true,
      preProcessor: function(data, next) {

        // Check to see if an action being accessed has requiresAuth property set to true
        if(data.actionTemplate.requiresAuth === true) {

          api.log("Checking if authenticated", "notice");

          // Is this session's 'client' authenticated?
          api.session.checkAuth(

            data.connection,             
            function () {
                next();
            },
            function () {
                var error = new Error("Permission denied. The client has not authenticated to the API via /api/auth. Did you forget this call?");
                next(error);
            },
            'client'

          );

        }
        else
          next();

      }
    };

    // Definition for the user auth middleware
    var userAuthMiddleware = {
      name: 'User authenication middleware.',
      global: true,
      preProcessor: function(data, next) {

        // Check to see if an action being accessed has requiresUserLogin property set to true
        if(data.actionTemplate.requiresUserLogin === true) {

          api.log("Checking if user authenticated", "notice");

          // Is this session's user authenticated?
          api.session.checkAuth(

            data.connection,             
            function () {
                next();
            },
            function () {

                api.log("You are not authorized for this action. Please login.", "error");

                var error = "You are not authorized for this action. Please login.";
                data.connection.rawConnection.responseHttpCode = 401;
                data.response.error = error;
                next(error);
            }

          );

        }
        else
          next();

      }
    };


    // Add this middleware for all actions
    api.actions.addMiddleware(apiAuthMiddleware);
    api.actions.addMiddleware(userAuthMiddleware);

    next();
  }
};