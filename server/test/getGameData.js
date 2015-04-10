process.env.NODE_ENV = 'test';

var should = require('should');
var request = require('request');
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
  it(' - Response has 200 status', function(done){
    request.get(url + '/gameData/', function(err, response, body) {
        response.should.have.status(200);
        done();
      });
  });

  // TEST: /api/gameData
  it(' - Response is valid JSON', function(done){
    request.get(url + '/gameData/', function(err, response, body) {
        body = JSON.parse(body);
        body.should.be.an.instanceOf(Object);
        
        done();
      });
  });

});