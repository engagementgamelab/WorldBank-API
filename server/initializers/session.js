module.exports = {
    loadPriority: 1000,
    startPriority: 1000,
    stopPriority: 1000,

    initialize: function(api, next) {

        api.session = function(type) {
            return {
                    prefix: "__" + type + "_session:",
                    duration: 60 * 60 * 1000 // 1 hour
            }
        };

        api.session.connectionKey = function(connection, type) {
            if (connection.type === 'web') {
                return api.session(type).prefix + connection.fingerprint;
            } else {
                return api.session(type).prefix + conneciton.id;
            }
        }

        api.session.save = function(connection, session, next, type) {
            var key = api.session.connectionKey(connection, type);


            api.cache.save(key, session, api.session.duration, function(error) {
                if (typeof next == "function") {                    
                    next(error);
                };
            });
        }

        api.session.load = function(connection, next, type) {
            var key = api.session.connectionKey(connection, type);

            api.cache.load(key, function(error, session, expireTimestamp, createdAt, readAt) {

                if (typeof next == "function") {
                    next(error, session, expireTimestamp, createdAt, readAt);
                }
            });
        }

        api.session.delete = function(connection, next) {
            var key = api.session.connectionKey(connection);
            api.cache.destroy(key, function(error) {
                next(error);
            });
        }

        api.session.generateAuth = function(connection, next, type) {

            if(type === undefined)
                type = 'user';

            var session = {
                loggedIn: true,
                loggedInAt: new Date().getTime(),
            }
            api.session.save(connection, session, function(error) {
                next(error);
            },
            type);
        }

        api.session.checkAuth = function(connection, successCallback, failureCallback, type) {

            if(type === undefined)
                type = 'user';
            
            api.session.load(connection, function(error, session) {

                if (session === null) {
                    session = {};
                }
                if (session.loggedIn !== true) {
                    connection.error = "You are not authorized for this action. Please login.";
                    failureCallback(connection, true); // likley to be an action's callback
                } else {
                    successCallback(session); // likley to yiled to action
                }
            },
            type);

        }

        api.session.fingerprint = function(connection){
          if(connection.fingerprint != null){
            return connection.fingerprint;
          }else{
            return connection.id;
          }
        }

        // api.session.clientStart = function(connection, next){

        //   var key = api.client_session.prefix + "-" + api.session.fingerprint(connection);
        //   var value = connection.session;

        //   api.cache.save(key, value, api.client_session.sessionExipreTime, function(err, didSave){
        //     api.cache.load(key, function(err, savedVal){
        //       if(typeof next == "function"){ next(err, savedVal); };
        //     });
        //   });

        // }

        // api.session.clientCheckAuth = function(connection, next){
          
        //   var key = api.client_session.prefix + "-" + api.session.fingerprint(connection);

        //   api.cache.load(key, function(err, value){
        //     connection.session = value;
        //     next(err, value);
        //   });

        // }

        next();
    },
    start: function(api, next) {
        next();
    },
    stop: function(api, next) {
        next();
    }
};