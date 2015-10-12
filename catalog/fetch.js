/*jshint esnext:true, node:true, unused:true */
'use strict';

let fs = require('fs');
let co = require("co");
let request = require("co-request");
let keys = require('./keys.json');

// Pass the components list you which to update ("react" or "react-native")
let componentsType = process.argv[2] || "react-native";
let componentsFile = `./components/${ componentsType }.json`;
let components = require(componentsFile);

// Load the existing data file, with all the existing metadata
let componentsDataFile = `./data/${ componentsType }.json`;
let oldComponentsData = [];

try { oldComponentsData = require(componentsDataFile); }
catch (e) { console.log(`Creating a new data file for ${ componentsType }.`); }

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

function isDoubleByte(str) {
  for (var i = 0, n = str.length; i < n; i++) {
    if (str.charCodeAt( i ) > 255) { return true; }
  }
  return false;
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

        let data = {
          name:        component.name,
          githubUser:  component.repo.split("/")[0],
          githubName:  component.repo.split("/")[1],
          description: (npm.description || "").trim(),
          keywords:    (npm.versions[npm["dist-tags"].latest].keywords || []).join(", "),
          modified:    npm.time.modified,
          stars:       github.stargazers_count,
          downloads:   (stat.downloads || [{ downloads: 0 }]).reduce((total, daily) => total + daily.downloads, 0),
          latestVersion: npm["dist-tags"].latest
        };

        // Log if the new data doesn't have stars information or a description
        if (typeof data.stars === 'undefined') console.log(`Component ${ component.name } has no stars`);
        if (!data.description) console.log(`Component ${ component.name } has no description`);

        // To save some bytes, if package name and repo name are equal, keep only one
        if (data.name === data.githubName) delete data.githubName;

        // Check if our custom description should be used instead
        if (component.custom_description) {
          if (component.description != data.description) { // Check if our custom_description is outdated
            console.log(`Component ${ component.name } has a new description: '${ data.description }'`);
          } else {
            data.description = component.custom_description; // Use our custom description
          }
        }

        // Add a trailing dot to the description
        if (!/[\.\?\!]$/.test(data.description) && !isDoubleByte(data.description)) {
          data.description += ".";
        }

        // If it's a react native component, check which platforms it has specific code for
        if (componentsType == "react-native") {
          options = {
            url: `${ endpoints.github }${ component.repo }/languages`,
            headers: { 'User-Agent': 'request' },
            auth: { 'user': keys.github.username, 'pass': keys.github.password },
            json: true
          };
          let languages = (yield request(options)).body;

          if (languages.Java) {
            data.platforms = { android: true };
          }
          if (languages['Objective-C']) {
            data.platforms = data.platforms || {};
            data.platforms.ios = true;
          }

          // Some older packages may be JavaScript only, and work in Android, but have just the "ios" keyword.
          // So only if there's Java or Objective-C code in the repo, we should check the keywords too.
          if (data.platforms && /iOS|Android/i.test(`${ data.keywords }`)) {
            // CLIs generate boilerplate code for both platforms, so using languages is unreliable.
            // However, using only the keywords here doesn't give better results either.
            // The best results were obtained when we used both approaches.
            if (/Android/i.test(data.keywords)) {
              data.platforms.android = true;
            }
            if (/iOS/i.test(data.keywords)) {
              data.platforms.ios = true;
            }
          }
        }

        resolve(data);
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
    allData[c.name] = c;
  });

  // Convert back to an array and make sure we ignore rejects
  Object.keys(allData).forEach(function(key) {
    if (!rejectedComponents[key]) newList.push(allData[key]);
  });

  // Persist the new data
  let str = JSON.stringify(newList);
  fs.writeFile(componentsDataFile, str);

  console.log("\nSuccess!");
});
