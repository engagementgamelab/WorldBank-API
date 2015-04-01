// ===============
// World Bank RBF
// Engagement Lab, 2015
// -------------
// Game Data Web Service
// ==============

exports.action = {
  name:                   'gameData',
  description:            'Retrieve all current game data.',
  blockedConnectionTypes: [],
  outputExample:          {},
  matchExtensionMimeType: false,
  version:                1.0,
  toDocument:             true,

  inputs: {},

  /* GET game data. */
  run: function(api, connection, next) {

    "use strict";

    var _fileOptions = { root: "content", filter: "yml", encoding: "utf8" };

    var fs = require('fs');
    var dir = require('node-dir');
    var _ = require('underscore');
    var YAML = require('yamljs');

    var response = [];

    function loadYML (filePath) {           
        // Test YAML, and throw exception on error
        try {
            var data = undefined;

            var fileContent = fs.readFileSync(filePath, _fileOptions.encoding);
            data = YAML.parse(fileContent);

            return data;

        } catch (err) {

            // Error, throw
            throw err;
            return false;

        }
    }

    function attachData(filePath) {

      response = [];

      var fileDir = filePath.substring(0, filePath.lastIndexOf('/'));
      var arrFileRoot = fileDir.split('/')
      var arrFileParentDirs = arrFileRoot.splice(arrFileRoot.indexOf('content')+1, arrFileRoot.length);

      var currentDirs = [];

      for(var f = 0; f < arrFileParentDirs.length; f++)
      {

        if(f > 0 && response[currentDirs[f-1]] !== undefined)
        {

          response[currentDirs[f-1]][currentDirs[f]] = [];
          var parent = {};
          parent[arrFileParentDirs[f]] = [];
          response.push(parent);
        }
        else 
        {
          var parent = {};
          parent[arrFileParentDirs[f]] = [];
          
          response.push(parent);
        }

      }

      return response;

    }

    // Go through all YAML files in our content folder
    dir.files("../content/", function(err, files) {
      if (err) throw err;

      var filesFiltered = _.filter(files, function(filePath) {

        return filePath.indexOf("." + _fileOptions.filter) !== -1;

      });


      _.each(filesFiltered, function(filePath) {

        var fileContent = loadYML(filePath);

        if(fileContent !== undefined) {
        // response.push(fileContent);
        attachData(fileContent, filePath);



        }

      });

      connection.response = response;
      next(connection, true);
    });

  }
};