var fs = require('fs');
var path = require('path');

var existing = {};
from_array_to_map(require('./components/react-native-ios.json'), existing);
from_array_to_map(require('./components/react-web.json'), existing);

var since_date = new Date(process.argv[2] || "2010-01-01");

var web_keywords = [
  "react-component",
  ["react", "component"],
  ["reactjs", "component"]
];

var native_keywords = [
  "react-native-component",
  ["react-native", "component"],
  ["react-native", "react-component"],
  ["react", "native", "component"]
];

function matcher(prop, partial_store, all_keywords) {
  for (var i = 0; i < all_keywords.length; i++) {
    if (all_keywords[i] instanceof Array) {
      if (partial_matcher(prop, all_keywords[i], partial_store)) {
        return true;
      }
    } else {
      if (prop.indexOf(all_keywords[i]) != -1) {
        return true;
      }
    }
  }
  return false;
}

function partial_matcher(prop, keywords, partial_store) {
  var complete = true;
  for (var i = 0; i < keywords.length; i++) {
    if (prop.indexOf(keywords[i]) != -1) {
      partial_store[keywords[i]] = true;
    }

    complete = complete && partial_store[keywords[i]];
  }
  return complete;
}

function from_array_to_map(ary, map) {
  for (var i = 0; i < ary.length; i++) {
    map[ary[i].name] = ary[i];
  }
}

function is_github_based(candidate) {
  return (candidate.repository && candidate.repository.url && candidate.repository.url.indexOf("github.com") != -1);
}

function is_modified_since(candidate, since) {
  return (candidate['time'] && candidate['time'].modified && new Date(candidate['time'].modified) >= since)
}

var p = new Promise(function(resolve,reject){
  var obj;
  fs.readFile(path.join(__dirname, 'data', 'npm.json'), 'utf8', function (err, data) {
    obj = JSON.parse(data);
    resolve(obj);
  });
}).then(function(data){
  var web_candidates = [];
  var native_candidates = [];

  var all_keys = Object.keys(data);


  all_keys.forEach(function(key){

    var candidate = data[key];
    var web_partial_store = {};
    var native_partial_store = {};

    if (candidate instanceof Object && is_modified_since(candidate, since_date) && is_github_based(candidate)) {

      if (candidate.keywords && candidate.keywords instanceof Array) {
        if (matcher(candidate.keywords, native_partial_store, native_keywords) && !existing[candidate.name]) {
          native_candidates.push(candidate);
          return;
        }

        if (matcher(candidate.keywords, web_partial_store, web_keywords) && !existing[candidate.name]) {
          web_candidates.push(candidate);
          return;
        }
      }

      if (candidate.description) {
        if (matcher(candidate.description, native_partial_store, native_keywords) && !existing[candidate.name]) {
          native_candidates.push(candidate);
          return;
        }

        if (matcher(candidate.description, web_partial_store, web_keywords) && !existing[candidate.name]) {
          web_candidates.push(candidate);
          return;
        }
      }

      if (candidate.readme) {
        if (matcher(candidate.readme, native_partial_store, native_keywords) && !existing[candidate.name]) {
          native_candidates.push(candidate);
          return;
        }

        if (matcher(candidate.readme, web_partial_store, web_keywords) && !existing[candidate.name]) {
          web_candidates.push(candidate);
          return;
        }
      }

      if (candidate.versions && candidate.versions instanceof Object) {
        var versions = Object.keys(candidate.versions);
        for (var v = 0; v < versions.length; v++) {
          if (versions[v].dependencies) {
            if (matcher(Object.keys(versions[v].dependencies), native_partial_store, native_keywords) && !existing[candidate.name]) {
              native_candidates.push(candidate);
              return;
            }

            if (matcher(Object.keys(versions[v].dependencies), web_partial_store, web_keywords) && !existing[candidate.name]) {
              web_candidates.push(candidate);
              return;
            }
          }
        }
      }

    }
  });

  fs.writeFile(path.join(__dirname, 'data', "web_candidates.json"), JSON.stringify(web_candidates, null, '  '));
  fs.writeFile(path.join(__dirname, 'data', "native_candidates.json"), JSON.stringify(native_candidates, null, '  '));

  console.log("finish: \n "+ web_candidates.length + " web components.\n " + native_candidates.length + " native components.");
});
