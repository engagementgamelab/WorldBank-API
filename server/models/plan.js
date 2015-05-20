/* 
World Bank API
Created by Engagement Lab, 2015
==============
 plan.js
 Plan data model.

 Created by Johnny Richardson on 5/17/15.
==============
*/
"use strict";

/**
* @class planModel
* @example
*	var Plan = require('../models/pan');
* @return Plan model
*/

// grab the things we need
var mongoose = require('mongoose');

// create a schema
var planSchema = new mongoose.Schema({

  unlocks: { type: Array, required: true },

});

planSchema.pre('validate', function(next) {
  // get the current date
  // var currentDate = new Date();
  
  // this.last_accessed = currentDate;

  next();
});

// Create the Plan model
var Plan = mongoose.model('Plan', planSchema);
module.exports =  Plan;