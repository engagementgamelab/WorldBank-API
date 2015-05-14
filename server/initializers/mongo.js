
var mongoose = require('mongoose');

module.exports = {
  loadPriority:  1000,
  startPriority: 1000,
  stopPriority:  1000,
  initialize: function(api, next){

    api.mongo = {
      mongoose: mongoose,
      user: require('../models/user')
    };

    next();
  },
  start: function(api, next) {

      mongoose.connect(api.config.mongo.host);

      var db = mongoose.connection;
      db.on('error', console.error.bind(console, 'connection error:'));
      db.once('open', function callback () {
          console.log('Connection opened');
      });

      next();

  },
  stop: function(api, next){
    next();
  }
};


// module.exports = {


// };