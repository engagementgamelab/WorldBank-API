
/* 
World Bank API
Created by Engagement Lab, 2015
==============
 routes.js
 Route mapping config file.

 Created by Johnny Richardson on 5/18/15.
==============
*/
"use strict";

/**
 *
 * Defined RESTful mapping to help route requests to actions, for web-based clients.
 * If the client doesn't specify an action in a param, and the base route isn't a named action, the action will attempt to be discerned from this routes.js file.
 * Route should be added for every action in api.actions namespace.
 * @namespace api.config
 * @class routes
 * @constructor
 * @static
 **/

 exports.default = { 
  routes: function(api){
    return {
      
      /* 
        Learn more here: http://www.actionherojs.com/docs/servers/web.html
      */

      get: [
        { path: '/gameData', action: 'gameData' } // (GET) /api/user/create
      ],
      post: [        
        { path: '/user/create', action: 'userCreate' }, // (POST) /api/user/create
        { path: '/user/save', action: 'userSave' },  // (POST) /api/user/save
        { path: '/user/auth', action: 'userAuth' }, // (POST) /api/user/auth
        { path: '/user/scenario', action: 'userAssignScenario' }, // (POST) /api/user/scenario
        
        { path: '/analytics/event', action: 'analyticsEvent' }, // (POST) /api/analytics/event
        
        { path: '/auth', action: 'apiAuth' }, // (POST) /api/auth
        
        { path: '/plan/all', action: 'allPlans' } // (POST) /api/plan/all
      ]
      
    }
  }
}