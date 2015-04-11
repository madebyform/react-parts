/*jshint node:true, unused:true */
var fs = require('fs');
var path = require('path');

var existing = {};
fromArrayToMap(require('./components/react-native-ios.json'), existing);
fromArrayToMap(require('./components/react-web.json'), existing);

var npmDataFilename = path.join(__dirname, 'data', 'npm.json');
var sinceDate = new Date(process.argv[2] || "2010-01-01");

var webCandidatesFilename = path.join(__dirname, 'data', "web-candidates.json");
var nativeCandidatesFilename = path.join(__dirname, 'data', "native-candidates.json");

// Keywords that identify a component for react for web
// For eg, `['foo', ['bar','baz']]` translates to `foo || (bar && baz)`
var webKeywords = [
  "react-component",
  ["react", "component"],
  ["reactjs", "component"]
];

// Keywords that identify a component for react native
var nativeKeywords = [
  "react-native-component",
  ["react-native", "component"],
  ["react-native", "react-component"],
  ["react", "native", "component"]
];

function matcher(prop, partialStore, allKeywords) {
  for (var i = 0; i < allKeywords.length; i++) {
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
  var complete = true;
  for (var i = 0; i < keywords.length; i++) {
    if (prop.indexOf(keywords[i]) != -1) {
      partialStore[keywords[i]] = true;
    }
    complete = complete && partialStore[keywords[i]];
  }
  return complete;
}

function fromArrayToMap(ary, map) {
  for (var i = 0; i < ary.length; i++) {
    map[ary[i].name] = ary[i];
  }
}

// Checks if the component is hosted on GitHub
function isGitHubBased(candidate) {
  return (candidate.repository && candidate.repository.url &&
    candidate.repository.url.indexOf("github.com") != -1);
}

function isModifiedSince(candidate, since) {
  return (candidate.time && candidate.time.modified &&
    new Date(candidate.time.modified) >= since);
}

function parseAndSave(data) {
  var webCandidates = [];
  var nativeCandidates = [];

  Object.keys(data).forEach(function(key) {
    var candidate = data[key];
    var webPartialStore = {};
    var nativePartialStore = {};

    // A component is considered if it's hosted on GitHub and matches the given modified timestamp
    if (!(candidate instanceof Object) || !isModifiedSince(candidate, sinceDate) || !isGitHubBased(candidate))
      return;

    if (candidate.keywords && candidate.keywords instanceof Array) {
      if (matcher(candidate.keywords, nativePartialStore, nativeKeywords) && !existing[candidate.name]) {
        nativeCandidates.push(candidate);
        return;
      }
      if (matcher(candidate.keywords, webPartialStore, webKeywords) && !existing[candidate.name]) {
        webCandidates.push(candidate);
        return;
      }
    }

    if (candidate.description) {
      if (matcher(candidate.description, nativePartialStore, nativeKeywords) && !existing[candidate.name]) {
        nativeCandidates.push(candidate);
        return;
      }
      if (matcher(candidate.description, webPartialStore, webKeywords) && !existing[candidate.name]) {
        webCandidates.push(candidate);
        return;
      }
    }

    if (candidate.readme) {
      if (matcher(candidate.readme, nativePartialStore, nativeKeywords) && !existing[candidate.name]) {
        nativeCandidates.push(candidate);
        return;
      }
      if (matcher(candidate.readme, webPartialStore, webKeywords) && !existing[candidate.name]) {
        webCandidates.push(candidate);
        return;
      }
    }

    if (candidate.versions && candidate.versions instanceof Object) {
      var versions = Object.keys(candidate.versions);
      for (var v = 0; v < versions.length; v++) {
        if (!versions[v].dependencies) continue;

        if (matcher(Object.keys(versions[v].dependencies), nativePartialStore, nativeKeywords) && !existing[candidate.name]) {
          nativeCandidates.push(candidate);
          return;
        }
        if (matcher(Object.keys(versions[v].dependencies), webPartialStore, webKeywords) && !existing[candidate.name]) {
          webCandidates.push(candidate);
          return;
        }
      }
    }
  });

  fs.writeFile(webCandidatesFilename, JSON.stringify(webCandidates, null, '  '));
  fs.writeFile(nativeCandidatesFilename, JSON.stringify(nativeCandidates, null, '  '));

  console.log("Finish: \n "+
    webCandidates.length +" web components.\n "+
    nativeCandidates.length +" native components.");
}

// Read and parse all the data in the file downloaded from NPM
fs.readFile(npmDataFilename, "utf8", function (err, data) {
  var json = JSON.parse(data);
  parseAndSave(json);
});
