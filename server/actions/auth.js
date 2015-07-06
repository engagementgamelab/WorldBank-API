/* 
World Bank API
Created by Engagement Lab, 2015
==============
 auth.js
 Game Auth (currently via key)

 Created by Johnny Richardson on 4/2/15.
==============
*/
var redisPrefix = "__auth-";
var cacheKey = function(data){
  return redisPrefix + data.params.key;
}

exports.apiAuth = {
  name: "apiAuth",
  description: "auth",
  inputs: {
    key: {required: true}
  },
  blockedConnectionTypes: [],
  outputExample: {},
  run: function(api, data, next) {

    data.response.authed = false;
    console.log(cacheKey(data));

    if (data.params.key == undefined) {
      data.error = "no key specified";
      next();
    }
    else if (api.config.general.serverToken != data.params.key) {
      data.error = "incorrect key";
      next();
    }
    else {
        api.session.generateAuth(
          data.connection,
          function() {
            data.response.authed = true;
            data.response.session_cookie = data.connection.fingerprint;
            next();
          }, 
          'client'
        );
      }
  }

};