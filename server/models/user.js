/* 
World Bank API
Created by Engagement Lab, 2015
==============
 user.js
 User data model.

 Created by Johnny Richardson on 4/10/15.
==============
*/
"use strict";

/**
* @class userModel
* @example
*	var User = require('../models/user');
* @return User model
*/

// grab the things we need
var mongoose = require('mongoose');

// create a schema
var userSchema = new mongoose.Schema({

  username: { type: String, required: true },
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, index: true },
  
  password: { type: String, required: false },
  password_salt: { type: String, required: false, index: true },
  
  location: { type: String, required: false },
  tutorial_1: {type: Boolean, required: true, default: false },
  tutorial_2: {type: Boolean, required: true, default: false },
  submitted_plan: {type: Boolean, required: true, default: false },
  plan_id: { type: String, required: false },
  current_scenario: { type: String, required: false },

  created_at: { type: Date, required: true },
  last_accessed: { type: Date, required: true }

});

userSchema.pre('validate', function(next) {
  // get the current date
  var currentDate = new Date();
  
  this.last_accessed = currentDate;

  next();
});

// Create the User model
var User = mongoose.model('User', userSchema);

// make this available to our users in our Node applications
module.exports = User;