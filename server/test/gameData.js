process.env.NODE_ENV = 'test';

var should = require('should');
var actionheroPrototype = require('actionhero').actionheroPrototype;
var actionHero = new actionheroPrototype();
var api;
var url;

describe('Action: Get Game Data', function(){

  before(function(done){

    // Start AH
    actionHero.start(function(err, a){
      api = a;
      url = 'http://localhost:' + api.config.servers.web.port + '/' + api.config.servers.web.urlPathForActions;
      done();
    })
  });

  // Kill AH
  after(function(done){
    actionHero.stop(function(err){
      done();
    });
  });

  // TEST: /api/gameData
  it(' - Response has characters, cities, phase_one, phase_two keys', function(done){
    api.specHelper.runAction('gameData', function(response, connection) {
        response.should.have.property('characters');
        response.should.have.property('cities');
        response.should.have.property('phase_one');
        response.should.have.property('phase_two');
        //response.should.have.status(200);
        done();
      });
  });

});