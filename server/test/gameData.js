process.env.NODE_ENV = 'test';

var should = require('should');
var actionheroPrototype = require('actionhero').actionheroPrototype;
var actionHero = new actionheroPrototype();
var api;
var url;

describe('Action: Get Game Data', function(){

  // Start AH
  before(function(done){

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
  it(' - Response has characters, cities, indicator_affects, phase_one, phase_two, routes, unlockables keys', function(done){
    api.specHelper.runAction('gameData', function(response, connection) {
        response.should.have.property('characters');
        response.should.have.property('cities');
        // response.should.have.property('grading');
        response.should.have.property('indicator_affects');
        response.should.have.property('phase_one');
        response.should.have.property('phase_two');
        response.should.have.property('routes');
        response.should.have.property('unlockables');
        //response.should.have.status(200);
        done();
      });
  });

});