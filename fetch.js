/*jshint esnext:true, node:true, unused:true */
'use strict';

let fs = require('fs');
let path = require('path');
let co = require("co");
let request = require("co-request");
let keys = require('./keys.json');

// Pass the components list you which to update ("react" or "react-native")
let componentsType = process.argv[2] || "react-native";
let componentsFile = path.join(__dirname, "components", `${ componentsType }.json`);
let components = require(componentsFile);

// Load the existing data file, with all the existing metadata
let componentsDataFile = path.join(__dirname, "data", `${ componentsType }.json`);
let oldComponentsData = require(componentsDataFile);

// Load rejected components. Rejected components will be removed from the data files
let rejectedComponents = toObject(require('./components/rejected.json'), {});

// We'll fetch metadata from NPM, GitHub and NPM-Stat
let endpoints = {
  npm: "https://registry.npmjs.com/",
  github: "https://api.github.com/repos/",
  npmStat: "http://npm-stat.com/downloads/range/"
};

function toObject(array, object) {
  array.forEach((element) => { object[element.name] = element; });
  return object;
}

let currentTime = new Date().toISOString().substr(0, 10), startTime;
let promises = [], options = {};

// Example usage: `npm run fetch react-web 2`
// This will make a partial update to the data file
if (process.argv[3]) {
  let interval = 50;
  let sliceArg = parseInt(process.argv[3]); // Eg: 2
  let sliceStart = sliceArg * interval - interval; // 50
  let sliceEnd   = sliceArg * interval; // 100
  components = components.slice(sliceStart, sliceEnd);
}

components.forEach(function(component) {
  promises.push(
    new Promise(function(resolve) {
      co(function* () {
        options = {
          url: endpoints.npm + component.name,
          json: true
        };
        let npm = (yield request(options)).body;

        options = {
          url: endpoints.github + component.repo,
          headers: { 'User-Agent': 'request' },
          auth: { 'user': keys.github.username, 'pass': keys.github.password },
          json: true
        };
        let github = (yield request(options)).body;

        startTime = new Date(npm.time.created).toISOString().substr(0,10);
        options = {
          url: `${ endpoints.npmStat }${ startTime }:${ currentTime }/${ component.name }`,
          json: true
        };
        let stat = (yield request(options)).body;

        resolve({
          name:        component.name,
          githubUser:  component.repo.split("/")[0],
          description: npm.description,
          homepage:    npm.versions[npm["dist-tags"].latest].homepage || `https://github.com/${ component.repo }`,
          keywords:    (npm.versions[npm["dist-tags"].latest].keywords || []).join(", "),
          modified:    npm.time.modified,
          stars:       github.stargazers_count,
          downloads:   (stat.downloads || [{ downloads: 0 }]).reduce((total, daily) => total + daily.downloads, 0),
          latestVersion: npm["dist-tags"].latest
        });
        process.stdout.write(".");

      }).catch(function() {
        process.stdout.write(` Problems with data for: ${ component.name } `);
        resolve(component);
      });
    })
  );
});

Promise.all(promises).then(function(newData) {
  let allData = {}, newList = [];

  // Merge old fetched data with the new one, since we may have done a
  // partial fetch this time
  oldComponentsData.concat(newData).forEach(function(c) {
    allData[c.name] = Object.assign(allData[c.name] || {}, c);
  });

  // Convert back to an array and make sure there aren't duplicates
  Object.keys(allData).forEach(function(key) {
    if (!rejectedComponents[key]) newList.push(allData[key]);
  });

  // Persist the new data
  let str = JSON.stringify(newList);
  fs.writeFile(componentsDataFile, str);

  console.log("\nSuccess!");
});
