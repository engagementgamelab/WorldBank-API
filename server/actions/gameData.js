/* 
World Bank API
Created by Engagement Lab, 2015
==============
 gameData.js
 Game Data Web Service.

 Created by Johnny Richardson on 4/1/15.
==============
*/
"use strict";

/**
* @module api
* @class gameData
* @return {Object} Raw JSON containing all current static game data.
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
        function loadFilesInPath(strFilepath, child, parent) {

            var fileResponse = {};
            var filePath = strFilepath;

            if(child !== undefined)
              filePath = filePath + '/' + child;

            // Get file stats and path base name
            var fileStats = fs.lstatSync(filePath);
            var fileBaseName = path.basename(filePath);

            // console.log(fileStats);

            // See if the current path is a directory
            if (fileStats.isDirectory()) {

              // Get directory contents
              var dirContents = fs.readdirSync(filePath);
              var dirContentsFiltered = {};

              // For all current sub-contents, check if each child is either a folder or file matching filter
              _.each(dirContents, function (subChild) {
                  var isFolder = subChild.indexOf(".") === -1;
                  var isMatchingFile = subChild.indexOf("." + _fileOptions.filter) !== -1;

                  if(isFolder)
                  {
                      if(parent.indexOf(child) !== -1) {
                        if(connection.response[child] === undefined)
                          connection.response[child] = {}; 
               
                        connection.response[child][subChild] = loadFilesInPath(filePath, subChild, parent);
                      }
                      else if(parent.indexOf(subChild) !== -1) {
                        connection.response[subChild] = loadFilesInPath(filePath, subChild, parent);
                      }
                  }

                  // Push match to filtered contents by running method again
                  if (isFolder || isMatchingFile) 
                  {
                    var keyName = isMatchingFile ? (subChild.substring(0, subChild.indexOf("."))) : subChild;         
                    dirContentsFiltered[keyName] = loadFilesInPath(filePath, subChild, parent);
                  }
              });

              return dirContentsFiltered

            }
            else {
              
              // Determine if file matches current filter
              if (child.indexOf("." + _fileOptions.filter) !== -1)
              {

                // If a YAML file, load content
                if(fileBaseName.substring(fileBaseName.indexOf(".")+1, fileBaseName.length) == "yml") {
                 
                  // Assign subcontents of this path
                  if(parent.indexOf(child) !== -1)
                    connection.response[fileBaseName.substring(0, fileBaseName.indexOf("."))] = loadYML(filePath);
                  else
                    fileResponse = loadYML(filePath);
                
                }
              }

            }

            return fileResponse;

        }

        // Recursively find all files specified by filter and load into response
        loadFilesInPath("../" + _fileOptions.root + "/", undefined, fs.readdirSync("../" + _fileOptions.root + "/"));
        next(connection, true);

    }
};