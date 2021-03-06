module.exports = {
    loadPriority: 1000,
    startPriority: 1000,
    stopPriority: 1000,

    initialize: function(api, next) {

        api.session = function(type) {
            return {
                    prefix: "__" + type + "_session:",
                    duration: 180 * 60 * 1000 // 3 hours
            }
        };

        api.session.connectionKey = function(connection, type) {

            if (connection.type === 'web') {
                api.log("fingerprint: " + connection.fingerprint, 'notice');
                
                return api.session(type).prefix + connection.fingerprint;
            }
            else {
                api.log("fingerprint: " + connection.id, 'notice');

                return api.session(type).prefix + connection.id;
            }
    
        }

        api.session.save = function(connection, session, next, type) {
            
            var key = api.session.connectionKey(connection, type);

            api.log("save key for type " + type + ": " + key, 'notice');

            api.cache.save(key, session, api.session.duration, function(error) {
                if (typeof next == "function") {                    
                    next(error);
                };
            });

        }

        api.session.load = function(connection, next, type) {
            var key = api.session.connectionKey(connection, type);

            api.cache.load(key, function(error, session, expireTimestamp, createdAt, readAt) {

                api.log("session loaded: " + key, 'notice');

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
                loggedInAt: new Date().getTime()
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
                    failureCallback(session);
                } else {
                    successCallback(session);
                }
            },
            type);

        }

        api.session.fingerprint = function(connection) {
          if(connection.fingerprint != null){
            return connection.fingerprint;
          }else{
            return connection.id;
          }
        }

        next();
    },
    start: function(api, next) {
        next();
    },
    stop: function(api, next) {
        next();
    }
};