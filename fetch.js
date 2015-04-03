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
  github: "https://api.github.com/repos/",
  npm_stat: "http://npm-stat.com/downloads/range/"
};

var promises = [];

components.forEach(function(component){

  var merge = function(val) {
    process.stdout.write(".");
    Object.assign(component, val);
  }
  
  promises.push(
    new Promise(function(resolve, reject){
      var options = {
        url: endpoints.npm + component.name
      };

      // NPM
      request(options, function(error, response, body) {
        var data = JSON.parse(body);
        var latestVersion = data["dist-tags"].latest;
        var githubUrl = "https://github.com/" + component.repo;

        resolve({
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
    }).then(function(val){
      merge(val);

      // NPM-STAT depends on the NPM, so we chain the promises
      return new Promise(function(resolve, reject){

        var current_time = (new Date()).toISOString().substr(0,10);
        var start = (new Date(component.created)).toISOString().substr(0,10);

        var options = {
          url: endpoints.npm_stat + start + ":" + current_time + "/" + component.name
        }

        request(options, function(error, response, body) {

          var data = JSON.parse(body);

          resolve({
            downloads: data.downloads.reduce(function(total, daily) {return total + daily.downloads}, 0)
          });

        });
      }); 
    }).then(merge)
  );

  promises.push(
    new Promise(function(resolve, reject){
      var options = {
        url: endpoints.github + component.repo,
        headers: { 'User-Agent': 'request' },
        auth: {'user': keys.github.username,'pass': keys.github.password}
      };

      request(options, function(error, response, body) {
        var data = JSON.parse(body);

        resolve({
          stars: data.stargazers_count,
          issues: data.open_issues_count
        });
      });
    }).then(merge)
  );

});

Promise.all(promises).then(function(values){
  console.log("\nsuccess!!");
  // Persist the new data
  var str = JSON.stringify(components, null, '  '); // \t for pretty-print
  fs.writeFile("data.json", str);
});
