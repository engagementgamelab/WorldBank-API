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
var random = require('mongoose-simple-random');

/**
* User plan model.
* @class plan
* @namespace models
* @constructor 
* @static
* @example
*	var Plan = require('../models/plan');
* @return Plan model
*/

// grab the things we need
var mongoose = require('mongoose');

// create a schema
var planSchema = new mongoose.Schema({

  name: { type: String, required: true },
  tactics: { type: Array, required: true },
  score: { type: Number, required: true, default: 10 },
  default_affects: { type: Array, required: true },
  pbc: { type: Boolean, required: true },
  autonomy: { type: Boolean, required: true },
  created_at: { type: Date, required: true }

});

planSchema.plugin(random);

// Create the Plan model
var Plan = mongoose.model('Plan', planSchema);
module.exports = Plan;