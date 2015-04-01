(function () {
    "use strict";
    
    var fs = require('fs');
    var YAML = require('yamljs');
    var dir = require('node-dir');
  
    /*
     * YAML validation
       -- content: YAML content to test
    */
    function validateYML (content) {
            
        // Test YAML, and throw exception on error
        try {
            
            var data = YAML.parse(content);
            JSON.stringify(data);

        } catch (err) {

            // Error, throw
            throw err;
            return false;

        }

    }

    // Go through all YAML files in our content folder
    dir.readFiles("../content/", {
        match: /.yaml|.yml$/,
        exclude: /^\./
        }, function(err, content, next) {
            if (err) throw err;
            
            // Run validate and keep going if it's kosher
            if(validateYML(content))
               next();
        },
        function(err, files){
            if (err) throw err;
            console.log('finished reading files:',files);
         }
    );

}());