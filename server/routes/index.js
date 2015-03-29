var express = require('express');
var router = express.Router();
var yaml = require('js-yaml');
var fs = require('fs');
var path = require('path');

/* GET home page. */
router.get('/', function(req, res, next) {

	var doc = undefined;

	// Get test YAML, or throw exception on error
	try {
	
	  var file = fs.readFileSync(path.join(__dirname, '../content/lome.yaml'), 'utf8');
	  doc = yaml.safeLoad(file);

	  console.log(doc);
	
	} catch (e) {
	  console.log(e);
	  doc = e;
	}


	res.render('index', { title: 'Engageserv', more: 'More to come...', sample: doc });

});


module.exports = router;
