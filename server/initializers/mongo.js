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
      
      mongoose.connect(
        'mongodb://' + 
        api.config.mongo.host + ':' + 
        api.config.mongo.port + '/' + 
        api.config.mongo.db
      );

      var connection = mongoose.connection.db;

      connection.on('error',  function callback (err) {
          console.log('Mongo connection failed: ' + err);
      });
      connection.once('open', function callback () {
          console.log('Mongo connection opened');
          api.log('Good to go!', 'notice');
      });

      next();

  },
  stop: function(api, next){
    next();
  }
};