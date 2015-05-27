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
*	var Plan = require('../models/plan');
* @return Plan model
*/

// grab the things we need
var mongoose = require('mongoose');

// create a schema
var planSchema = new mongoose.Schema({

  name: { type: String, required: true },
  unlocks: { type: Array, required: true },
  pbc: { type: Boolean, required: true, default: false },
  autonomy: { type: Boolean, required: true, default: false }

});

planSchema.pre('validate', function(next) {
  // get the current date
  // var currentDate = new Date();
  
  // this.last_accessed = currentDate;

  next();
});

// Create the Plan model
var Plan = mongoose.model('Plan', planSchema);
module.exports = Plan;