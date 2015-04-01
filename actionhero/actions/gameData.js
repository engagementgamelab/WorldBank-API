// ===============
// World Bank RBF
// Engagement Lab, 2015
// -------------
// Game Data Web Service
// ==============
exports.action = {
  name:                   'gameData',
  description:            'gameData',
  blockedConnectionTypes: [],
  outputExample:          {},
  matchExtensionMimeType: false,
  version:                1.0,
  toDocument:             true,

  inputs: {},

  /* GET game data. */
  run: function(api, connection, next) {

    "use strict";

    var fs = require('fs');
    var dir = require('node-dir');
    var YAML = require('yamljs');

    var doc = undefined;
    var response = [];

    function loadYML (content) {           
        // Test YAML, and throw exception on error
        try {
            
            var data = YAML.parse(content);
            var str = JSON.stringify(data);

            response.push(data);

            return true;
        } catch (err) {

            // Error, throw
            throw err;
            return false;

        }
    }

    // Go through all YAML files in our content folder
    dir.readFiles("../content/", {
        match: /.yaml$/,
        exclude: /^\./
        }, function(err, content, next) {
            if (err) throw err;
            
            if(loadYML(content))
               next();
        },
        function(err, files){
            if (err) throw err;
          connection.response = response;
          next(connection, true);
         }
    );

  }
};