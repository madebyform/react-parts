/*jshint node:true, unused:true */
var fs = require('fs');
var path = require('path');

var existingNativeComponents = require('./components/react-native-ios.json');
var existingWebComponents = require('./components/react-web.json');
var rejectedComponents = require('./components/rejected.json');

var existing = {};
fromArrayToMap(existingNativeComponents, existing);
fromArrayToMap(existingWebComponents, existing);
fromArrayToMap(rejectedComponents, existing);

var npmDataFilename = path.join(__dirname, 'data', 'npm.json');
var sinceDate = new Date(process.argv[2] || "2010-01-01");

// Paths to the JSON files with the lists of components
var webCandidatesFilename = path.join(__dirname, 'components', "react-web.json");
var nativeCandidatesFilename = path.join(__dirname, 'components', "react-native-ios.json");

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
      repo: repoUrlToShortRepo(candidate.repository.url),
      // npm: "https://npmjs.com/package/" + candidate.name,
      // github: candidate.repository.url.replace("git://", "https://")
    };
  });
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
      if (matcher(candidate.description.toLowerCase(), nativePartialStore, nativeKeywords) && !existing[candidate.name]) {
        nativeCandidates.push(candidate);
        return;
      }
      if (matcher(candidate.description.toLowerCase(), webPartialStore, webKeywords) && !existing[candidate.name]) {
        webCandidates.push(candidate);
        return;
      }
    }

    if (candidate.readme) {
      if (matcher(candidate.readme.toLowerCase(), nativePartialStore, nativeKeywords) && !existing[candidate.name]) {
        nativeCandidates.push(candidate);
        return;
      }
      if (matcher(candidate.readme.toLowerCase(), webPartialStore, webKeywords) && !existing[candidate.name]) {
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

  // Keep only the component name and its repo
  webCandidates = slimComponentInfo(webCandidates);
  nativeCandidates = slimComponentInfo(nativeCandidates);

  // Update the JSON files
  var webComponents = existingWebComponents.concat(webCandidates);
  var nativeComponents = existingNativeComponents.concat(nativeCandidates);
  fs.writeFile(webCandidatesFilename, JSON.stringify(webComponents, null, '  '));
  fs.writeFile(nativeCandidatesFilename, JSON.stringify(nativeComponents, null, '  '));

  console.log("Completed with: \n "+
    webCandidates.length +" new web components\n "+
    nativeCandidates.length +" new native components");
}

// Read and parse all the data in the file downloaded from NPM
fs.readFile(npmDataFilename, "utf8", function (err, data) {
  var json = JSON.parse(data);
  parseAndSave(json);
});
