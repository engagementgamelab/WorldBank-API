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

/**
 *
 * Defines MongoDB config.
 * @namespace api.config
 * @class mongo
 * @constructor
 * @static
 **/

/**
* Base mongo config. Suitable for non-PAAS servers.
* @method default
*/
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

/**
* Staging mongo config. PAAS example provided by default.
* @method staging
*/
exports.staging = { 
  mongo: function(api){
    return {
        enable: true,
        host: 'npvs26cw:xxxxxxyyyyyzzz@aa0111111.mongo.com',
        port: 53370,
        db: 'db_npvs26cw'
    }
  }
}