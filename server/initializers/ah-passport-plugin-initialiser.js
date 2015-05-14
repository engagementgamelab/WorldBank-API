/*jslint node: true */
"use strict";

module.exports=
{
	initialize: function(api, next)
	{
		api.log("ah-passport-plugin initialiser: Started...", "debug");

		api.log(api.config.AHPassportPlugin.strategies);

		var LocalStrategy = require('passport-local').Strategy;

		// Mediocre test, this needs improvement
		if(typeof(api.config.AHPassportPlugin)==="object")
		{
			api.log("ah-passport-plugin initialiser: Found config object!", "debug");

			// Reference: https://gist.github.com/joshbirk/1732068

			// Set up the passport main object
			api.AHPassportPlugin = require("passport");
			api.log("ah-passport-plugin initialiser: passport 'require' done", "debug");

			api.AHPassportPlugin.use(new LocalStrategy(
			  function(username, password, done) {

				api.log("ah-passport-plugin initialiser: User find", "debug", user);
			    
			    User.findOne({ username: username }, function (err, user) {
			      if (err) { return done(err); }
			      if (!user) { return done(null, false); }
			      if (!user.verifyPassword(password)) { return done(null, false); }
			      return done(null, user);
			    });
			    
			  }
			));

		// Adapted from https://groups.google.com/forum/#!msg/actionhero-js/1OQiN_7Gpmw/jVLwKD2F_1MJ
			var AHPassportPluginMiddleware=function(connection, actionTemplate, next)
			{
				api.AHPassportPlugin.initialize()(connection.rawConnection.req, connection.rawConnection.res, function ()
				{
					api.AHPassportPlugin.session()(connection.rawConnection.req, connection.rawConnection.res, function ()
					{
						return next(connection, true);
					});
				});
			};

			api.actions.addPreProcessor(AHPassportPluginMiddleware, 10);
			api.log("ah-passport-plugin initialiser: Adding preProcessor to run authentication middleware", "debug");
		}
	
		api.log("ah-passport-plugin initialiser: Done!", "debug");

		next();
	},
	start: function(api, next)
	{
		next();
	},
	stop: function(api, next)
	{
		next();
	}
};