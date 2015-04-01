/*jshint node:true */
'use strict';

// Start by registering a hook that makes calls to `require` run ES6 code
// This will be the only file where JSX and ES6 features are not supported
require('babel/register');

var fs = require('fs');
var async = require('async');
var request = require('request');
var ejs = require('ejs');
var React = require('react');

var endpoints = {
  npm: "https://registry.npmjs.com/",
  github: "https://api.github.com/repos/"
};

// The catalog of react packages
var components = require('./components');

// Make the components catalog available globally
global.components = components;

// Require and wrap the React main component in a factory before calling it
// This is necessary because we'll do `App()` instead of <App />
var App = React.createFactory(require("./src/app.jsx").App);

// Render the app and send the markup for faster page loads and SEO
// On the client, React will preserve the markup and only attach event handlers
function render(templateFile, app, components) {
  var output = React.renderToString(app);

  // Use Embedded JavaScript to embed the output from React into our layout
  return ejs.render(fs.readFileSync(templateFile, "utf8"), {
    output: output,
    components: components
  });
}

// Fetch the package.json for a given component
function fetchPackageInfo(component, callback) {
  var options = {
    url: endpoints.npm + component.name
  };
  request(options, function(error, response, body) {
    var data = JSON.parse(body);
    var latestVersion = data["dist-tags"].latest;
    var githubUrl = "https://github.com/" + component.repo;

    callback(error, {
      name: component.name,
      githubUser: component.repo.split("/")[0],
      githubRepo: component.repo.split("/")[1],
      description: data.description,
      latestVersion: latestVersion,
      versions: Object.keys(data.versions).length,
      homepage: data.versions[latestVersion].homepage || githubUrl,
      created: data.time.created,
      modified: data.time.modified
    });
  });
}

// Fetch statistics from the GitHub repository
function fetchStats(component, callback) {
  var options = {
    url: endpoints.github + component.repo,
    headers: { 'User-Agent': 'request' }
  };
  request(options, function(error, response, body) {
    var data = JSON.parse(body);

    callback(error, {
      stars: data.stargazers_count,
      issues: data.open_issues_count
    });
  });
}

// Fetch data and build the app
async.map(components, fetchPackageInfo, function(error, data) {
  if (error) console.error(error);
  console.log("Package info fetched successfully.");

  components.map(function(component, index) {
    return Object.assign(component, data[index]);
  });

  async.map(components, fetchStats, function(error, data) {
    if (error) console.error(error);
    console.log("GitHub stats fetched successfully.");

    components.map(function(component, index) {
      return Object.assign(component, data[index]);
    });

    var html = render("template.ejs", new App(), components);
    fs.writeFileSync("index.html", html);
  });
});
