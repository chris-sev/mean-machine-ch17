//Base Setup

//Call Packages
var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var morgan = require('morgan');
var mongoose = require('mongoose');
var config = require('./config');
var path = require('path');

// APP CONFIGURATION
// use body parser so we can grab info from POST requests
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());

// configure our app to handle CORS requests
app.use(function(req, res, next) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST');
  res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type, \
      Authorization');
  next();
});

// connect to the local database
mongoose.connect(config.database);

// log all requests to the console
app.use(morgan('dev'));

// set static files location
// used for requests made by the frontend
app.use(express.static(__dirname + '/public'));

//ROUTES FOR OUR API
var apiRoutes = require('./app/routes/api')(app, express);
app.use('/api', apiRoutes);

// Main Catchall Route
// Send users to frontend
// Must be registered after API ROUTES
app.get('*', function(req, res) {
  res.sendFile(path.join(__dirname + '/public/app/views/index.html'));
});

// START THE SERVER
app.listen(config.port);
console.log('Now active on port ' + config.port);