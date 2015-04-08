/* 
World Bank API
Created by Engagement Lab, 2015
==============
 gameData.js
 Game Data Web Service.

 Created by Johnny Richardson on 4/1/15.
==============
*/

exports.action = {
    name: 'gameData',
    description: 'Retrieve all current game data.',
    blockedConnectionTypes: [],
    outputExample: {},
    matchExtensionMimeType: false,
    version: 1.0,
    toDocument: true,

    inputs: {},

    /* GET game data. */
    run: function (api, connection, next) {

        "use strict";

        var _fileOptions = {
            root: "content",
            filter: "yml",
            encoding: "utf8"
        };

        var fs = require('fs');
        var path = require('path')
        var dir = require('node-dir');
        var YAML = require('yamljs');
        var _ = require('underscore');

        // Parse YAML syntax given a file path, and throw exception on error
        function loadYML(filePath) {
            try {
                var data = undefined;

                // Read file synchronously
                var fileContent = fs.readFileSync(filePath, _fileOptions.encoding);
                data = YAML.parse(fileContent);

                return data;

            } catch (err) {

                // Error, throw
                throw err;
                return false;

            }
        }

        // Given a root path, recursively crawl all sub-folders and load content of any files matching current filter
        function loadFilesInPath(strFilepath, parent) {

            var fileResponse = {};

            // Get file stats and path base name
            var fileStats = fs.lstatSync(strFilepath);
            var fileBaseName = path.basename(strFilepath);

            // console.log(fileStats);

            // See if the current path is a directory
            if (fileStats.isDirectory()) {

              // Get directory contents
              var dirContents = fs.readdirSync(strFilepath);
              var dirContentsFiltered = [];

              // For all current sub-contents, check if each child is either a folder or file matching filter
              _.each(dirContents, function (child) {
                  var isFolder = child.indexOf(".") === -1;
                  var isMatchingFile = child.indexOf("." + _fileOptions.filter) !== -1;

                  // Push match to filtered contents by running method again
                  if (isFolder || isMatchingFile) 
                    dirContentsFiltered.push(loadFilesInPath(strFilepath + '/' + child));
                      console.log(fileBaseName + " **** " + parent.indexOf(fileBaseName));

                  // Assign subcontents of this path
                  if(isFolder && parent.indexOf(fileBaseName) !== -1){
                    connection.response[fileBaseName] = [];
                  }
                  else if(isFolder || isMatchingFile)
                  {
                      console.log(fileBaseName + " //// " + isMatchingFile + "  === " + connection.response);
                      connection.response[fileBaseName].push(dirContentsFiltered, parent);
                  }
              });

            }
            else {
              
              // Determine if file matches current filter
              if (strFilepath.indexOf("." + _fileOptions.filter) !== -1)
              {
                // If a YAML file, load content
                if(fileBaseName.substring(fileBaseName.indexOf(".")+1, fileBaseName.length) == "yml")
                  fileResponse[fileBaseName.substring(0, fileBaseName.indexOf("."))] = loadYML(strFilepath);
              }

            }

            return fileResponse;

        }

        // Recursively find all files specified by filter and load into response
        console.log(fs.readdirSync("../" + _fileOptions.root + "/"));
        loadFilesInPath("../" + _fileOptions.root + "/", fs.readdirSync("../" + _fileOptions.root + "/"));
        next(connection, true);

    }
};