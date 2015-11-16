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

      var connection = mongoose.createConnection(
        'mongodb://' + 
        api.config.mongo.host + ':' + 
        api.config.mongo.port + '/' + 
        api.config.mongo.db
      ).db;

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