/* 
World Bank API
Created by Engagement Lab, 2015
==============
 auth.middleware.js
 API authenication middleware initializer.

 Created by Johnny Richardson on 7/2/15.
==============
*/
"use strict";

module.exports = {

  initialize: function(api, next) {

    // Definition for the API client auth middleware
    var apiAuthMiddleware = {
      name: 'API authenication middleware.',
      global: true,
      preProcessor: function(data, next) {

        // Check to see if an action being accessed has requiresAuth property set to true
        if(data.actionTemplate.requiresAuth === true) {

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
      name: 'API authenication middleware.',
      global: true,
      preProcessor: function(data, next) {

        // Check to see if an action being accessed has requiresUserLogin property set to true
        if(data.actionTemplate.requiresUserLogin === true) {

          // Is this session's user authenticated?
          api.session.checkAuth(

            data.connection,             
            function () {
                next();
            },
            function () {
                var error = "You are not authorized for this action. Please login.";
                data.connection.rawConnection.responseHttpCode = 401;
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