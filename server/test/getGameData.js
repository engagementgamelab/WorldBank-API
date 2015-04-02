process.env.NODE_ENV = 'test';

var should = require('should');
var actionheroPrototype = require('actionhero').actionheroPrototype;
var actionHero = new actionheroPrototype();
var api;

describe('Action: Get Game Data', function(){

  before(function(done){

    // Start AH
    actionHero.start(function(err, a){
      api = a;
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
  it(' - Response is valid JSON', function(done){
    api.specHelper.runAction('gameData', function(response, connection) {
      response.should.be.json;
      done();
    });
  });

});