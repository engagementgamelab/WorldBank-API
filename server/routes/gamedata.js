// ===============
// World Bank RBF
// Engagement Lab, 2015
// -------------
// Game Data Web Service
// ==============
(function () {
    "use strict";

    var express = require('express');
    var router = express.Router();
    var yaml = require('js-yaml');
    var fs = require('fs');
    var dir = require('node-dir');
    var YAML = require('yamljs');

    /* GET game data. */
    router.get('/get', function(req, res, next) {

        var doc = undefined;
        var response = [];

        function loadYML (content) {           
            // Test YAML, and throw exception on error
            try {
                
                var data = YAML.parse(content);
                var str = JSON.stringify(data);

                response.push(data);

                return true;
            } catch (err) {

                // Error, throw
                throw err;
                return false;

            }
        }

        // Go through all YAML files in our content folder
        dir.readFiles("../content/", {
            match: /.yaml$/,
            exclude: /^\./
            }, function(err, content, next) {
                if (err) throw err;
                
                if(loadYML(content))
                   next();
            },
            function(err, files){
                if (err) throw err;
                
                res.send(response);
             }
        );

    });

    module.exports = router;

}());