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
mongoose.connect('mongodb://localhost/world_bank_rbf');
var Schema = mongoose.Schema;

// create a schema
var userSchema = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, index: true },
  location: { type: String, required: true },
  meta: {
  	plan: Number
  },
  created_at: { type: Date, required: true },
  last_accessed: { type: Date, required: true }
});

// Create the User model
var User = mongoose.model('User', userSchema);

// make this available to our users in our Node applications
module.exports = User;