/*Define dependencies.*/

var express=require("express");
var router = express.Router();
var multer  = require('multer');

var done=false;

/*Handling routes.*/

router.get('/',function(req,res){
  res.sendFile(__dirname + "/migrate.html");
});

/*router.post('/mail',function(req,res){
  console.log(req.get('content-type'));
  if(done==true){
    console.log(req.files);
    res.end("File uploaded.");
  }
});*/

module.exports = router;