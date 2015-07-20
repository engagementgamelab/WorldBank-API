/* 
World Bank API
Created by Engagement Lab, 2015
==============
 mongo.js
 MongodDB/Mongoose AH initializer.

 Created by Johnny Richardson on 5/18/15.
==============
*/
"use strict";

var fs = require('fs');
var yaml = require('yamljs');
var analytics = require('universal-analytics');

module.exports = {
  loadPriority:  1000,
  startPriority: 1000,
  stopPriority:  1000,
  initialize: function(api, next){

    // Global config options
    var _configOptions = {
        content_root: api.config.general.paths.content,
        filter: "yml",
        encoding: "utf8",
        settings: "config.yml",
        googleAppId: "UA-64617433-2",
    };

    // Logging
    api.log('Content root is ' + _configOptions.content_root, 'notice');
    
    // Parse YAML syntax given a file path, and throw exception on error
    api.readYaml = function loadYML(filePath, fileRoot) {

      if(fileRoot === undefined)
        fileRoot = _configOptions.content_root;

      // Logging
      api.log('Loading YAML at ' + fileRoot + "/" + filePath, 'info');

      var pathToYml = fileRoot + "/" + filePath;

      try {
          var data = undefined;

          // Read file synchronously
          var fileContent = fs.readFileSync(pathToYml, _configOptions.encoding);
          data = yaml.parse(fileContent);

          return data;

      } catch (err) {

          // Error, throw
          throw err;
          return false;

      }

    }

    // Global config for tracking analytics
    api.trackEvent = function analyticsEvent(userId, eventName, eventCategory, callback) {

      var visitor = analytics(_configOptions.googleAppId, userId);
      
      visitor.event(eventCategory, eventName, function (err) {
        if(callback !== undefined)
          callback(err);
      });

    }

    // Store global config for API-wide usage
    api.gameConfig = {

      // Load global content config
      content: api.readYaml(_configOptions.settings),
      options: _configOptions
      
    };

    next();

  },
  start: function(api, next) {


      next();

  },
  stop: function(api, next){
    next();
  }
};