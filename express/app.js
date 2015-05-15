var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var multer =require('multer');
var fs = require('fs');

var PythonShell = require('python-shell');

var routes = require('./routes/index');
var users = require('./routes/users');
var migrate = require('./routes/migrate');

var app = express();


var done=false;

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', routes);
app.use('/users', users);
app.use('/migrate', migrate);

app.use('/gallery', require('node-gallery')({
  staticFiles : 'public/assets',
  urlRoot : 'gallery', 
  title : 'Unity Assets Gallery'
}));

app.use(multer({ dest: './uploads/',
 rename: function (fieldname, filename) {
    return filename+Date.now();
  },
  onFileUploadStart: function (file) {
    console.log(file.originalname + ' is starting ...')
  },
  onFileUploadComplete: function (file) {
    console.log(file.fieldname + ' uploaded to  ' + file.path)
    done=true;
  }
}));

app.post('/migrate/mail',function(req,res){
  if(done==true){

    var options = { 
      args: ["--gmail", './uploads/'+req.files["mailFile"]["name"], "--user=" + req.body.username, "--password=" + req.body.password ],
      pythonPath: '/usr/bin/python',
    };

    PythonShell.run('imap_upload.py', options, function (err) {
      
      // fs.unlink('./uploads/'+req.files["mailFile"]["name"]);
      res.end("File uploaded.");

    });

  }
});

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});


module.exports = app;
