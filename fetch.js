/*jshint node:true, unused:vars */
/*globals Promise*/
'use strict';

require('babel/register');

var fs = require('fs');
var path = require('path');
var request = require('request');
var keys = require('./keys.json');

// Pass the components list you which to update "react" or "react-native-ios"
var componentsType = process.argv[2] || "react-native-ios";
var componentsFile = path.join(__dirname, 'components', componentsType + '.json');
var components = require(componentsFile);
var componentsDataFile = path.join(__dirname, 'data', componentsType + '.json');
var oldComponentsData = require(componentsDataFile);
var rejectedComponents = require('./components/rejected.json');

var endpoints = {
  npm: "https://registry.npmjs.com/",
  github: "https://api.github.com/repos/",
  npm_stat: "http://npm-stat.com/downloads/range/"
};

var promises = [];

// Example usage: `npm run fetch react-web 2`
// This will make a partial update to the data file
if (process.argv[3]) {
  var sliceArg = parseInt(process.argv[3]); // Eg: 2
  var sliceStart = sliceArg * 100 - 100;    // 100
  var sliceEnd   = sliceArg * 100;          // 200
  components = components.slice(sliceStart, sliceEnd);
}

function fromArrayToMap(ary, map) {
  for (var i = 0; i < ary.length; i++) {
    map[ary[i].name] = ary[i];
  }
}

components.forEach(function(component) {
  var merge = function(val) {
    process.stdout.write(".");
    Object.assign(component, val);
  };

  promises.push(
    new Promise(function(resolve, reject) {
      var options = {
        url: endpoints.npm + component.name,
        json: true
      };

      // NPM
      request(options, function(error, response, data) {
        if (!data["dist-tags"]) console.log("Problems with dist data for: "+ component.name);
        var latestVersion = data["dist-tags"].latest;
        var githubUrl = "https://github.com/" + component.repo;

        resolve({
          name: component.name,
          githubUser: component.repo.split("/")[0],
          description: data.description,
          latestVersion: latestVersion,
          homepage: data.versions[latestVersion].homepage || githubUrl,
          keywords: (data.versions[latestVersion].keywords || []).join(", "),
          created: data.time.created,
          modified: data.time.modified
        });

      });
    }).then(function(val) {
      merge(val);

      // NPM-STAT depends on the NPM, so we chain the promises
      return new Promise(function(resolve, reject) {
        var currentTime = (new Date()).toISOString().substr(0,10);
        var start = (new Date(component.created)).toISOString().substr(0,10);

        var options = {
          url: endpoints.npm_stat + start + ":" + currentTime + "/" + component.name,
          json: true
        };

        request(options, function(error, response, data) {
          var noDownloads = [{downloads: 0}];

          resolve({
            downloads: (data.downloads || noDownloads).reduce(function(total, daily) {
              return total + daily.downloads;
            }, 0)
          });
        });
      });
    }).then(merge)
  );

  promises.push(
    // GitHub
    new Promise(function(resolve, reject) {
      var options = {
        url: endpoints.github + component.repo,
        headers: { 'User-Agent': 'request' },
        auth: { 'user': keys.github.username, 'pass': keys.github.password },
        json: true
      };

      request(options, function(error, response, data) {
        resolve({
          stars: data.stargazers_count
        });
      });
    }).then(merge)
  );
});

Promise.all(promises).then(function(values) {
  var allData = {}, newList = [], rejected = {};
  fromArrayToMap(rejectedComponents, rejected);

  // Merge old fetched data with the new one, since we may have done a
  // partial fetch this time
  oldComponentsData.concat(components).forEach(function(c) {
    allData[c.name] = Object.assign(allData[c.name] || {}, c);
  });

  // Convert back to an array and make sure there aren't duplicates
  Object.keys(allData).forEach(function(key) {
    if (!rejected[key])
      newList.push(allData[key]);
  });

  // Persist the new data
  var str = JSON.stringify(newList);
  fs.writeFile(componentsDataFile, str);

  console.log("\nSuccess!");
});
