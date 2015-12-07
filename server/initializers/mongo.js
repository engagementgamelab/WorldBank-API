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

/**
 *
 * Defines global mongoosejs config. It is NOT recommended to modify this configuration.
 * @namespace initializers
 * @class mongo
 * @constructor
 * @static
 **/
var mongoose = require('mongoose');

module.exports = {
  loadPriority:  1000,
  startPriority: 1000,
  stopPriority:  1000,
  initialize: function(api, next){

    api.mongo = {
      mongoose: mongoose,
      user: require('../models/user'),
      plan: require('../models/plan')
    };

    next();
  },
  start: function(api, next) {
      
      mongoose.connect(
        'mongodb://' + 
        api.config.mongo.host + ':' + 
        api.config.mongo.port + '/' + 
        api.config.mongo.db
      );

      var connection = mongoose.connection.db;

      connection.on('error',  function callback (err) {
          api.log('Mongo connection failed: ' + err, 'crit');
      });
      connection.once('open', function callback () {
          api.log('Mongo connection opened', 'debug');
          api.log('Good to go!', 'alert');
      });

      next();

  },
  stop: function(api, next){
    next();
  }
};