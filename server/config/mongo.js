/* 
World Bank API
Created by Engagement Lab, 2015
==============
 mongo.js
 MongodDB/Mongoose config file.

 Created by Johnny Richardson on 5/18/15.
==============
*/
"use strict";

exports.default = { 
  mongo: function(api){
    return {
        enable: true,
        host: 'localhost',
        port: 27017,
        db: 'world_bank_rbf'
    }
  }
}

exports.staging = { 
  mongo: function(api){
    return {
        enable: true,
        host: 'heroku_zzxzs87s:n18c7h47ojg43mh7sghpik1pid@ds031952.mongolab.com',
        port: 31952,
        db: 'heroku_zzxzs87s'
    }
  }
}