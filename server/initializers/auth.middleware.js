module.exports = {

  initialize: function(api, next){

    var authenticationMiddleware = {
      name: 'authentication Middleware',
      global: true,
      preProcessor: function(data, next) {

        if(data.actionTemplate.requiresAuth === true) {

          api.session.checkAuth(
            data.connection, 
            function () {
                next();
            },
            function () {
                error = new Error("Permission denied. The client has not authenticated to the API via /api/auth. Did you forget this call?");
                next(error);
            },
            'client'
          );

        }
        else
          next();

      }
    };

    api.actions.addMiddleware(authenticationMiddleware);

    next();
  }
};