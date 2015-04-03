/* 
World Bank API
Created by Engagement Lab, 2015
==============
 login.js
 Game Auth (currently via key)

 Created by Johnny Richardson on 4/2/15.
==============
*/
var redisPrefix = "__auth-";
var cacheKey = function(connection){
  return redisPrefix + connection.params.key;
}

exports.login = {
  name: "login",
  description: "login",
  inputs: {
    key: {required: true}
  },
  blockedConnectionTypes: [],
  outputExample: {},
  run: function(api, connection, next) {

    connection.response.auth = false;
    console.log(cacheKey(connection));

    if (connection.params.key == undefined) {
      connection.error = "no key specified";
      next(connection, true);
    }
    else if (api.config.general.serverToken != connection.params.key) {
      connection.error = "incorrect key";
      next(connection, true);
    }
    else {
        api.session.generateAtLogin(connection, function() {
          connection.response.auth = true;
          next(connection, true);
        });
      }
  }

};