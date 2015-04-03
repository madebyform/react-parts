/*jshint node:true */
'use strict';

// Start by registering a hook that makes calls to `require` run ES6 code
// This will be the only file where JSX and ES6 features are not supported
require('babel/register');

var React = require('react');
var express = require('express');
var ejs = require('ejs');
var server = express();

// Use Embedded JavaScript to embed the output from React into our layout
server.set('view engine', 'ejs');

// Require and wrap the React main component in a factory before calling it
// This is necessary because we'll do `App()` instead of <App />
var App = React.createFactory(require("./src/app.jsx").App);

server.get('/', function(req, res) {
  // The catalog of react packages
  var components = require('./data.json');

  // Render the app and send the markup for faster page loads and SEO
  // On the client, React will preserve the markup and only attach event handlers
  var app = new App({ components: components });
  var output = React.renderToString(app);

  res.render('template', {
    output: output,
    components: components
  });
});

// Serve static files
server.use('/', express.static('assets'));

// Listen for connections
server.listen(process.env.PORT || 8080, function() {
  console.log('Server is listening...');
});
