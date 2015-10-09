/**
* @module api
*/
// BASE SERVER CONFIG
exports.default = {
  general: function(api){
    return {
      apiVersion: '0.0.18',
      serverName: 'World Bank API',
      // id can be set here, or it will be generated dynamically.
      //  Be sure that every server you run has a unique ID (which will happen when generated dynamically)
      //  id: 'myActionHeroServer',
      // A unique token to your application that servers will use to authenticate to each other
      serverToken: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
      // The welcome message seen by TCP and webSocket clients upon connection
      welcomeMessage: 'Hello! Welcome to the Engagement Lab API!',
      // the redis prefix for actionhero's cache objects
      cachePrefix: 'actionhero:cache:',
      // the redis prefix for actionhero's cache/lock objects
      lockPrefix: 'actionhero:lock:',
      // how long will a lock last before it exipres (ms)?
      lockDuration: 1000 * 10, // 10 seconds
      // Watch for changes in actions and tasks, and reload/restart them on the fly
      developmentMode: true,
      // Should we run each action within a domain? Makes your app safer but slows it down
      actionDomains: true,
      // How many pending actions can a single connection be working on
      simultaneousActions: 5,
      // disables the whitelisting of client params
      disableParamScrubbing: false,
      // params you would like hidden from any logs
      filteredParams: [],
      // values that signify missing params
      missingParamChecks: [null, '', undefined],
      // The default filetype to server when a user requests a directory
      directoryFileType : 'index.html',
      // The default priority level given to preProcessors, postProcessors, createCallbacks, and destroyCallbacks
      defaultMiddlewarePriority : 100,
      // configuration for your actionhero project structure
      paths: {
        'action':      [ __dirname + '/../actions'      ] ,
        'task':        [ __dirname + '/../tasks'        ] ,
        'public':      [ __dirname + '/../public'       ] ,
        'pid':         [ __dirname + '/../pids'         ] ,
        'log':         [ __dirname + '/../log'          ] ,
        'server':      [ __dirname + '/../servers'      ] ,
        'initializer': [ __dirname + '/../initializers' ] ,
        'plugin':      [ __dirname + '/../node_modules' ],
        // Engagement Lab API: This is a custom folder for our YAML content
        'content':      [ '../content' ]
      },
      // hash containing chat rooms you wish to be created at server boot
      startingChatRooms: {
        // format is {roomName: {authKey, authValue}}
        //'secureRoom': {authorized: true},
        'defaultRoom': {},
        'anotherRoom': {},
      }
    }
  }
}

// STAGING SERVER CONFIG
exports.staging = { 
  general: function(api){
    // New Relic RPM init
    require('newrelic');
    
    return {
      developmentMode: false,
      // configuration for your actionhero project structure
      paths: {
        // Engagement Lab API: This is a custom folder for our YAML content
        'content':      [ 'content' ]
      }
    }
  }
}

// PRODUCTION SERVER CONFIG
exports.production = { 
  general: function(api){
    // New Relic RPM init
    require('newrelic');

    return {  
      serverToken: '27a3996e6c59d6f1c38331517732eebdd879d4574eae2c6d7a7290be7d1bd49e',
      developmentMode: false,
      // configuration for your actionhero project structure
      paths: {
        // Engagement Lab API: This is a custom folder for our YAML content
        'content':      [ '../content' ]
      }
    }
  }
}