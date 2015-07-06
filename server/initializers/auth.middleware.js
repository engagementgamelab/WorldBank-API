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

  initialize: function(api, next){

    // Definition for the middleware
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

    // Add this middleware for all actions
    api.actions.addMiddleware(apiAuthMiddleware);

    next();
  }
};