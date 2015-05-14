/*jslint node: true */
"use strict";

exports.default =
{
	AHPassportPlugin: function(api)
	{
		return {

			_toExpand:false, 
			strategies:
			{
				"local":
				{
					pluginNPMModuleName:"passport-local",
					pluginSubObjectName:"Strategy",
					StrategyVerifyFunction:null,

					// TODO: Decide if it's worthwhile having this param
					useBuiltinSessions:true
				}
			},
			serialiseUser:function(user, done)
			{
				if(typeof(done)==="function")
				{
					return done(null, user);
				}
				else
				{
					return false;
				}
			},
			deserialiseUser:function(obj, done)
			{
				if(typeof(done)==="function")
				{
					return done(null, obj);
				}
				else
				{
					return false;
				}
			}
		};
	}
};

exports.production=
{
	AHPassportPlugin: function(api)
	{
		return {
			
		};
	}
};

exports.uat=
{
	AHPassportPlugin: function(api)
	{
		return {
			
		};
	}
};

exports.development=
{
	AHPassportPlugin: function(api)
	{
		return {
			
		};
	}
};



