module.exports = {
    loadPriority: 1000,
    startPriority: 1000,
    stopPriority: 1000,
    initialize: function(api, next) {

        api.session = {
            prefix: "__session:",
            duration: 60 * 60 * 1000, // 1 hour
        };

        api.session.connectionKey = function(connection) {
            if (connection.type === 'web') {
                return api.session.prefix + connection.rawConnection.fingerprint;
            } else {
                return api.session.prefix + conneciton.id;
            }
        }

        api.session.save = function(connection, session, next) {
            var key = api.session.connectionKey(connection);
            api.cache.save(key, session, api.session.duration, function(error) {
                if (typeof next == "function") {
                    next(error);
                };
            });
        }

        api.session.load = function(connection, next) {
            var key = api.session.connectionKey(connection);
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

        api.session.generateAtLogin = function(connection, next) {
            var session = {
                loggedIn: true,
                loggedInAt: new Date().getTime(),
            }
            api.session.save(connection, session, function(error) {
                next(error);
            });
        }

        api.session.checkAuth = function(connection, successCallback, failureCallback) {
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
            });
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