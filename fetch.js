/*jshint node:true */
'use strict';

require('babel/register');

var fs = require('fs');
var async = require('async');
var request = require('request');
var components = require('./components.json');
var keys = require('./keys.json');

var endpoints = {
  npm: "https://registry.npmjs.com/",
  github: "https://api.github.com/repos/"
};

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
    headers: { 'User-Agent': 'request' },
    auth: {'user': keys.github.username,'pass': keys.github.password}
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

    // Persist the new data
    var str = JSON.stringify(components, null, '  '); // \t for pretty-print
    fs.writeFile("data.json", str);
  });
});
