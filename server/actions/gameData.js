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

var fs = require('fs');
var path = require('path')
var dir = require('node-dir');
var _ = require('underscore');

exports.action = {
    name: 'gameData',
    description: 'Retrieve all current game data.',
    blockedConnectionTypes: [],
    outputExample: {},
    matchExtensionMimeType: false,
    version: 1.4,
    toDocument: true,
    // requiresAuth: true,

    inputs: {},

    /* GET game data. */
    run: function (api, data, next) {

        // Get global config options
        var _fileOptions = api.gameConfig.options;

        // Load global content config
        var _contentConfig = api.gameConfig.content;

        // Find the corresponding config value in our global content config file 
        // if any of the YAML input has the "$config_" prefix
        function findConfigValues(ymlValue) {
          
            for (var i in ymlValue) {
                
                if (!ymlValue.hasOwnProperty(i)) continue;
                else if (typeof ymlValue[i] == 'boolean' || typeof ymlValue[i] == 'number') continue;
                else if (typeof ymlValue[i] == 'object') findConfigValues(ymlValue[i]); 

                // Does this value access a config global?
                else if (ymlValue[i].indexOf("$config_") !== -1) {
                  
                  var configPath = ymlValue[i].replace("$config_","").split("_");
                  var configVal = _contentConfig;
                
                  // Crawl through the config path until we have the correct value
                  // eg. cooldown -> short
                  _.each(configPath, function (pathKey) {
                    
                    if(configVal[pathKey] !== undefined)
                      configVal = configVal[pathKey];

                  });

                  // Set this YAML val to be the config value that was found
                  ymlValue[i] = configVal;

                }

            }

            return ymlValue;
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

                  // Is this child a folder or matching file (and is not our config settings file)?
                  var isFolder = subChild.indexOf(".") === -1;
                  var isMatchingFile = subChild.indexOf("." + _fileOptions.filter) !== -1;

                  // Determine if this file has sibling files with same filter type
                  var siblingMatchTest = dirContents.join(',').match(new RegExp(_fileOptions.filter, "g"));
                  var hasSiblingMatches = siblingMatchTest !== null && siblingMatchTest.length > 1;

                  if(isFolder)
                  {
                    if(parent.indexOf(subChild) !== -1) {

                      var fileResponse = loadFilesInPath(filePath, subChild, parent);
  
                      if(fileResponse != false)
                        data.response[subChild] = loadFilesInPath(filePath, subChild, parent);
                    }
                  }

                  // Push match to filtered contents by running method again
                  if (isFolder || isMatchingFile) 
                  {
                    var keyName = isMatchingFile ? (subChild.substring(0, subChild.indexOf("."))) : subChild;

                    // If file has siblings, make this node an array, otherwise it remains an object
                    if(hasSiblingMatches) {
                      if(!(dirContentsFiltered instanceof Array)) 
                        dirContentsFiltered = [];

                      var fileResponse = loadFilesInPath(filePath, subChild, parent);

                      dirContentsFiltered.push(fileResponse);
                    }
                    else
                     var fileResponse = loadFilesInPath(filePath, subChild, parent);

                     dirContentsFiltered[keyName] = fileResponse;
                  }
              });

              return dirContentsFiltered;

            }
            else {

              // Determine if file matches current filter and is not our config settings file
              if (child.indexOf("." + _fileOptions.filter) !== -1 && child != _fileOptions.settings)
              {

                // If a YAML file, load content
                if(fileBaseName.substring(fileBaseName.lastIndexOf(".")+1, fileBaseName.length) == _fileOptions.filter) {

                  try {
           
                    var ymlContent = api.readYaml(filePath);

                    // Do not output file contents if marked as private (is used internally by API)
                    if(ymlContent.private == undefined || !ymlContent.private)
                    {

                      ymlContent = findConfigValues(ymlContent);

                      // Assign subcontents of this path
                      if(parent.indexOf(child) !== -1)
                        data.response[fileBaseName.substring(0, fileBaseName.lastIndexOf("."))] = ymlContent;
                      else
                        fileResponse = ymlContent;
                    }

                  }
                  catch(e) {

                    // Create error and set response to 400 bad request
                    data.rawConnection.responseHttpCode = 400;

                    if(data.response.errors == null)
                        data.response.errors = []
                    
                    data.response.errors.push(e);
                    
                    data.error = new Error(e);

                  }
                  
                }
              }

            }

            return fileResponse;

        }

        // Recursively find all files specified by filter and load into response
        loadFilesInPath(_fileOptions.content_root + "/", undefined, fs.readdirSync(_fileOptions.content_root + "/"));
        next();

    }
};