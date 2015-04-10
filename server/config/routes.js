exports.default = { 
  routes: function(api){
    return {
      
      /* 
      routes.js 

      For web clients (http and https) you can define an optional RESTful mapping to help route requests to actions.
      If the client doesn't specify and action in a param, and the base route isn't a named action, the action will attempt to be discerned from this routes.js file.

      Learn more here: http://www.actionherojs.com/docs/servers/web.html

      */

/*      get: [
      ],*/
      post: [
        // { path: '/login/:userID(^\\d{3}$)', action: 'login' } // (POST) /api/login/123
        { path: '/user/create', action: 'userCreate' } // (GET) /api/user/create
      ]

      /* ---------------------

      all: [
        { path: '/user/:userID', action: 'user' } // (*) / /api/user/123
      ]
      
      ---------------------- */
      
    }
  }
}