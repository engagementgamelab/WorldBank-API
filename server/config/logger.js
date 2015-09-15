var fs = require('fs');
var cluster = require('cluster');

exports.default = {
    logger: function(api) {
        var logger = {
            transports: []
        };

        // console logger
        if (cluster.isMaster) {
            logger.transports.push(function(api, winston) {
                return new(winston.transports.Console)({
                    colorize: true,
                    // level: 'debug',
                    level: 'debug',
                    timestamp: api.utils.sqlDateTime
                });
            });
        }

        // file logger
        try {
            fs.mkdirSync('./log');
        } catch (e) {
            if (e.code !== 'EEXIST') {
                return next([new Error('Cannot create ./log directory'), e])
            }
        }
        logger.transports.push(function(api, winston) {
            return new(winston.transports.File)({
                filename: api.config.general.paths.log[0] + '/' + api.pids.title + '.log',
                level: 'debug',
                timestamp: true
            });
        });

        return logger;
    }
}

exports.production = {
    logger: function(api) {
        var logger = {
            transports: []
        };

        // console logger
        if (cluster.isMaster) {
            logger.transports.push(function(api, winston) {
                return new(winston.transports.Console)({
                    colorize: false,
                    level: 'error',
                    timestamp: api.utils.sqlDateTime
                });
            });
        }

        return {
            level: 'error',
            transports: null
        }
    }
}