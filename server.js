/*jshint node:true */
'use strict';

// Start by registering a hook that makes calls to `require` run ES6 code
// This will be the only file where JSX and ES6 features are not supported
require('babel/register');

var fs = require('fs');
var React = require('react');
var Router = require('react-router');
var express = require('express');
var cachify = require('connect-cachify');
var ejs = require('ejs');
var getSearchResults = require('./src/get-search-results');
var sortBy = require('./src/sort');
var server = express();
var production = (process.env.NODE_ENV != "development");

// List of assets where the keys are your production urls, and the value
// is a  list of development urls that produce the same asset
var assets = {
  "/app.min.js": [ "/app.js" ]
};

// Enable browser cache and HTTP caching (cache busting, etc.)
server.use(cachify.setup(assets, {
  root: "assets",
  production: production
}));

// Serve static files
server.use('/', express.static('assets'));

// Use Embedded JavaScript to embed the output from React into our layout
server.set('view engine', 'ejs');

// Require and wrap the React main component in a factory before calling it
// This is necessary because we'll do `App()` instead of <App />
var routes = require("./src/app.jsx").routes;

// Redirect the user to the list of native components
server.get('/', function(req, res) {
  res.redirect('/native');
});

// Redirect legacy iOS path to the common native tab
server.get('/native-ios', function(req, res) {
  res.redirect('/native');
});

// Return the HTML page with the list of native components for iOS or components for web
server.get('/:type(web|native)', function(req, res) {
  var currentPage = parseInt(req.query.page || 1, 10);
  var searchOptions = {
    type: req.params.type,
    page: Math.max(0, currentPage - 1) // In Algolia, pagination starts with 0
  };

  getSearchResults(searchOptions).then(function(data) {
    var components = data.components;

    Router.run(routes, req.url, function (handler, state) {
      var initialData = {
        components: components,
        currentPage: currentPage,
        debugMode: !production,
        searchQuery: state.searchQuery,
        searchCount: data.searchCount,
        type: state.params.type
      };

      // Render the app and send the markup for faster page loads and SEO
      // On the client, React will preserve the markup and only attach event handlers
      var Handler = React.createFactory(handler);
      var content = new Handler(initialData);
      var output = React.renderToString(content);

      res.render('template', {
        output: output,
        initialData: JSON.stringify(initialData)
      });
    });
  });
});

// Listen for connections
server.listen(process.env.PORT || 8080, function() {
  console.log('Server is listening...');
});
