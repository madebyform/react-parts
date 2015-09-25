/*jshint esnext:true, node:true, unused:true */
'use strict';

let fs = require('fs');
let path = require('path');

// Paths to the JSON files with the lists of components
let nativeComponentsFilename = path.join(__dirname, "components", "react-native.json");
let webComponentsFilename = path.join(__dirname, "components", "react-web.json");
let rejectedComponentsFilename = path.join(__dirname, "components", "rejected.json");

// Load existing components
let existingNativeComponents = require(nativeComponentsFilename);
let existingWebComponents = require(webComponentsFilename);
let rejectedComponents = require(rejectedComponentsFilename);

// List of all existing components (native, web and rejected)
let existing = toObject(existingNativeComponents, {});
toObject(existingWebComponents, existing);
toObject(rejectedComponents, existing);

let npmDataFilename = path.join(__dirname, 'data', 'npm.json');
let sinceDate = new Date(process.argv[2] || "2010-01-01");

// Keywords that identify a component for react for web
// For eg: `['foo', ['bar','baz']]` translates to `foo || (bar && baz)`
let webKeywords = [
  "react-component",
  ["react", "component"],
  ["reactjs", "component"]
];

// Keywords that identify a component for react native
let nativeKeywords = [
  "react-native",
  "react-native-component",
  ["react-native", "component"],
  ["react-native", "react-component"],
  ["react", "native", "component"]
];

function toObject(array, object) {
  array.forEach((element) => { object[element.name] = element; });
  return object;
}

function matcher(prop, partialStore, allKeywords) {
  for (let i = 0; i < allKeywords.length; i++) {
    if (allKeywords[i] instanceof Array) {
      if (partialMatcher(prop, allKeywords[i], partialStore))
        return true;
    } else {
      if (prop.indexOf(allKeywords[i]) != -1)
        return true;
    }
  }
  return false;
}

function partialMatcher(prop, keywords, partialStore) {
  let complete = true;
  for (let i = 0; i < keywords.length; i++) {
    if (prop.indexOf(keywords[i]) != -1) {
      partialStore[keywords[i]] = true;
    }
    complete = complete && partialStore[keywords[i]];
  }
  return complete;
}

// Checks if the component is hosted on GitHub
function isGitHubBased(candidate) {
  return (candidate.repository && candidate.repository.url &&
    candidate.repository.url.indexOf("github.com") != -1);
}

// Check if the given candidate has been modified since a given date
function isModifiedSince(candidate, since) {
  return (candidate.time && candidate.time.modified &&
    new Date(candidate.time.modified) >= since);
}

// Receives an URL to GitHub and returns a shorthand
// (eg: "http://github.com/madebyform/react-parts" becomes "madebyform/react-parts")
function repoUrlToShortRepo(url) {
  return url.replace(/^.*\:\/\//, "") // Remove protocol
    .replace(/\.git(#.+)?$/, "") // Remove .git (and optional branch) suffix
    .replace(/(\w+@)?github\.com[\/\:]/, ""); // Remove domain or ssh clone url
}

// Keep only the component name and its repo
function slimComponentInfo(components) {
  return components.map(function(candidate) {
    return {
      name: candidate.name,
      repo: repoUrlToShortRepo(candidate.repository.url)
    };
  });
}

function parseAndSave(data) {
  let webCandidates = [];
  let nativeCandidates = [];

  Object.keys(data).forEach(function(key) {
    let candidate = data[key];
    let webPartialStore = {};
    let nativePartialStore = {};

    // A component is considered if it's hosted on GitHub and matches the given timestamp
    if (!(candidate instanceof Object) || !isModifiedSince(candidate, sinceDate) ||
      !isGitHubBased(candidate) || existing[candidate.name]) {
        return;
    }

    // Search for keywords in the `keywords` prop
    if (candidate.keywords && candidate.keywords instanceof Array) {
      if (matcher(candidate.keywords, nativePartialStore, nativeKeywords)) {
        return nativeCandidates.push(candidate);
      }
      if (matcher(candidate.keywords, webPartialStore, webKeywords)) {
        return webCandidates.push(candidate);
      }
    }

    // Search for keywords in the other text props
    ["name", "description", "readme"].forEach(function(prop) {
      if (candidate[prop]) {
        if (matcher(candidate[prop].toLowerCase(), nativePartialStore, nativeKeywords)) {
          return nativeCandidates.push(candidate);
        }
        if (matcher(candidate[prop].toLowerCase(), webPartialStore, webKeywords)) {
          return webCandidates.push(candidate);
        }
      }
    });

    // Search for keywords inside versions
    if (candidate.versions && candidate.versions instanceof Object) {
      let versions = Object.keys(candidate.versions);

      versions.forEach(function(version) {
        ["dependencies", "peerDependencies", "devDependencies"].forEach(function(prop) {
          if (version[prop]) {
            if (matcher(version[prop], nativePartialStore, nativeKeywords)) {
              return nativeCandidates.push(candidate);
            }
            if (matcher(version[prop], webPartialStore, webKeywords)) {
              return webCandidates.push(candidate);
            }
          }
        });
      });
    }
  });

  // Keep only the component name and its repo
  webCandidates = slimComponentInfo(webCandidates);
  nativeCandidates = slimComponentInfo(nativeCandidates);

  // Update the JSON files
  let webComponents = existingWebComponents.concat(webCandidates);
  let nativeComponents = existingNativeComponents.concat(nativeCandidates);
  fs.writeFile(webComponentsFilename, JSON.stringify(webComponents, null, '  '));
  fs.writeFile(nativeComponentsFilename, JSON.stringify(nativeComponents, null, '  '));

  console.log(`Completed with ${ webCandidates.length } web components ` +
    `and ${ nativeCandidates.length } native components`);
}

// Read and parse all the data in the file downloaded from NPM
fs.readFile(npmDataFilename, "utf8", function (err, data) {
  let json = JSON.parse(data);
  parseAndSave(json);
});
