/*jshint esnext:true, node:true, unused:true */
'use strict';

let fs = require("fs");
let path = require("path");
let co = require("co");
let request = require("co-request");
let keys = require("./keys.json");
let cheerio = require("cheerio");
let marky = require("marky-markdown");
let throat = require('throat')(50); // 50 is the max number of parallel requests

/* Utility functions */

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

function sliceArray(array, index, size) {
  if (index) {
    let sliceIndex = parseInt(index, 10);      // Eg: 2
    let sliceStart = sliceIndex * size - size; // Eg: 50
    let sliceEnd   = sliceIndex * size;        // Eg: 100
    return array.slice(sliceStart, sliceEnd);
  } else {
    return array;
  }
}

// Receives an URL to GitHub and returns a shorthand
// (eg: "http://github.com/madebyform/react-parts" becomes "madebyform/react-parts")
function githubUrlToRepo(url) {
  return url.replace(/^.*\:\/?\/?/, "") // Remove protocol (eg: "http://", "github:")
    .replace(/\.git(#.+)?$/, "") // Remove .git (and optional branch) suffix
    .replace(/(\w+@)?github\.com[\/\:]/, ""); // Remove domain or ssh clone url
}

/* Functions for fetching data from remote services */

const requestOptions = {
  json: true,
  timeout: 20000
};

// We'll fetch metadata from NPM, GitHub and NPM-Stat
const endpoints = {
  npm: "https://registry.npmjs.com/",
  github: "https://api.github.com/repos/",
  npmStat: "http://npm-stat.com/downloads/range/"
};

let Fetch = {
  npm: function* (component) {
    let options = Object.assign({}, requestOptions, {
      url: `${ endpoints.npm }${ component.name }`
    });
    let result = (yield request(options)).body;
    if (!result.description && !component.description) {
      throw `Component ${ component.name } has no description`;
    }
    return result;
  },
  npmStat: function* (component, createdAt) {
    let startTime = new Date(createdAt).toISOString().substr(0,10);
    let currentTime = new Date().toISOString().substr(0, 10);
    let options = Object.assign({}, requestOptions, {
      url: `${ endpoints.npmStat }${ startTime }:${ currentTime }/${ component.name }`
    });
    let result = (yield request(options)).body;
    return result;
  },
  githubRepo: function* (component) {
    let options = Object.assign({}, requestOptions, {
      url: `${ endpoints.github }${ component.repo }`,
      headers: { 'User-Agent': 'request' },
      auth: { 'user': keys.github.username, 'pass': keys.github.password }
    });
    let result = (yield request(options)).body;
    if (result.message) {
      throw result.message;
    }
    return result;
  },
  githubLanguages: function* (component) {
    let auth = keys.githubLanguages || keys.github;
    let options = Object.assign({}, requestOptions, {
      url: `${ endpoints.github }${ component.repo }/languages`,
      headers: { 'User-Agent': 'request' },
      auth: { 'user': auth.username, 'pass': auth.password }
    });
    let result = (yield request(options)).body;
    if (result.message) {
      throw result.message;
    }
    return result;
  },
  githubReadme: function* (component) {
    let auth = keys.githubReadme || keys.github;
    let options = Object.assign({}, requestOptions, {
      url: `${ endpoints.github }${ component.repo }/readme`,
      headers: { 'User-Agent': 'request', 'Accept': "application/vnd.github.v3.html+json" },
      auth: { 'user': auth.username, 'pass': auth.password }
    });
    let result = (yield request(options)).body;
    if (typeof result !== "string") {
      if (result.message === "Not Found") {
        return `No documentation is available for this component. Consider helping the community by ` +
          `<a href="https://github.com/${ component.repo }/new/master?readme=1">writing a README</a>.`;
      } else {
        throw result.message;
      }
    }
    return result;
  }
};

/* Functions for keeping the `components/*` files updated */

let Update = {
  description(npm, component, warn) {
    let newDescription = npm.description || "";

    if (typeof component.original_description !== "undefined") {
      if (component.original_description != newDescription) {
        component.original_description = newDescription;
        warn(component.name, `Component with custom description has new description: '${ newDescription }'`);
      }
    } else if (component.description != newDescription) {
      component.description = newDescription;
    }
  },
  repoWithNpm(npm, component) {
    let repo = (typeof component.original_repo !== "undefined") ? component.original_repo : component.repo;
    let newRepo = (npm.repository && npm.repository.url) ? githubUrlToRepo(npm.repository.url) : "";

    // Check if the repository has changed. This may happen if the component's author offered
    // the package name to someone else for a new component. If we have a custom repo,
    // only perform a change if the original changed. This allows us to wrong repos.
    if (newRepo !== "" && newRepo !== repo) {
      component.repo = newRepo;
      delete component.original_repo;
    }
  },
  repoWithGithub(github, component) {
    if (github.full_name && github.full_name.toLowerCase() != component.repo.toLowerCase()) {
      if (!component.original_repo) component.original_repo = component.repo;
      component.repo = github.full_name;
    }
  }
};

/* Functions for processing the data */

let Process = {
  description(npmDescription, component) {
    let description = component.description.trim();

    // Add a trailing dot to the description
    if (!/[\.\?\!]$/.test(description) && !isDoubleByte(description)) {
      description += ".";
    }
    return description;
  },
  platforms(languages, keywords) {
    let platforms;

    if (languages.Java) {
      platforms = { android: true };
    }
    if (languages['Objective-C']) {
      platforms = platforms || {};
      platforms.ios = true;
    }

    // Some older packages may be JavaScript only, and work in Android, but have just the "ios" keyword.
    // So only if there's Java or Objective-C code in the repo, we should check the keywords too.
    //
    // CLIs generate boilerplate code for both platforms, so using languages is unreliable.
    // However, using only the keywords here doesn't give better results either.
    // The best results were obtained when we used both approaches.
    if (platforms && /Android/i.test(keywords)) {
      platforms.android = true;
    }
    if (platforms && /iOS/i.test(keywords)) {
      platforms.ios = true;
    }
    return platforms;
  },
  readme(html, component) {
    // Options for `marky-markdown`, that helps us process READMEs
    let markyOptions = {
      sanitize: false,           // False since it's already done by GitHub
      highlightSyntax: false,    // Also done by GitHub
      prefixHeadingIds: false,   // Prevent DOM id collisions
      serveImagesWithCDN: false, // Use npm's CDN to proxy images over HTTPS
      debug: false,              // console.log() all the things

      // NPM package metadata to rewrite relative URLs, etc.
      package: {
        name: component.name,
        description: component.description,
        repository: {
          type: "git",
          url: `https://github.com/${ component.repo }`
        }
      },
      // We can't override the options `marky-markdown` sends down to `markdown-it`.
      // We are using a fork that enables us to pass a `renderer` option.
      // In this case we are passing the already rendered HTML from GitHub.
      renderer: { render(html) { return html; } }
    };

    // Remove the anchors GitHub adds to titles
    let $ = cheerio.load(html);
    $(".anchor").remove();

    // Convert relative URLs and images, removing redundant info, etc.
    $ = marky($.html(), markyOptions);

    return $.html();
  }
};

/* Iterate through the batch and update metadata and readmes */

function fetch(componentsType, callback, options) {
  let componentsFile = path.resolve(__dirname, `./components/${ componentsType }.json`);

  // Load the data file with all the existing metadata
  let componentsDataFile = path.resolve(__dirname, `./data/${ componentsType }.json`);
  let oldComponentsData = [];
  try { oldComponentsData = require(componentsDataFile); }
  catch (e) { console.log(`Creating a new data file for ${ componentsType }.`); }

  // Load rejected components. Rejected components will be removed from the data files
  let rejectedComponentsFile = path.resolve(__dirname, './components/rejected.json');
  let rejectedComponents = toObject(require(rejectedComponentsFile), {});

  // Load existing documentation
  let docsFile = path.resolve(__dirname, "./data/docs.json");
  let docs = {};
  try { docs = require(docsFile); }
  catch (e) { console.log(`Creating a new data file for docs.`); }

  let promises = [];

  let components = options.components || require(componentsFile);
  let error = options.error || console.error;
  let warn = options.warn || console.warn;
  let batchIndex = options.batchIndex; // If null, batch includes all components
  let batchSize = options.batchSize || 50;

  sliceArray(components, batchIndex, batchSize).forEach(function(component) {
    promises.push(throat(function() {
      return new Promise(function(resolve) {
        co(function* () {
          let npm = yield Fetch.npm(component);
          Update.description(npm, component, warn);
          Update.repoWithNpm(npm, component);

          let github = yield Fetch.githubRepo(component);
          Update.repoWithGithub(github, component);

          let stat = yield Fetch.npmStat(component, npm.time.created);

          let data = {
            name:        component.name,
            githubUser:  component.repo.split("/")[0],
            githubName:  component.repo.split("/")[1],
            keywords:    (npm.versions[npm["dist-tags"].latest].keywords || []).join(", "),
            modified:    npm.time.modified,
            stars:       github.stargazers_count,
            downloads:   (stat.downloads || [{ downloads: 0 }]).reduce((total, daily) => total + daily.downloads, 0),
            latestVersion: npm["dist-tags"].latest
          };

          // To save some bytes, if package name and repo name are equal, keep only one
          if (data.name === data.githubName) delete data.githubName;

          // Use a custom description if necessary and add trailing dot
          data.description = Process.description(npm.description, component);

          // If it's a react native component, check which platforms it has specific code for
          if (componentsType == "react-native") {
            let languages = yield Fetch.githubLanguages(component);
            data.platforms = Process.platforms(languages, data.keywords);
          }

          // Get the readme from GitHub. They are more frequently updated than `npm.readme`
          // and we can grab them rendered, which minimizes the chance of displaying them
          // differently than they appear on GitHub.
          let readme = yield Fetch.githubReadme(component);
          docs[component.name] = Process.readme(readme, component);

          resolve(data);
          process.stdout.write(".".green);

        }).catch(function(e) {
          resolve(null);
          process.stdout.write("✕".red);
          error(component.name, `Problems with data for component - ${ e }`);
        });
      });
    }));
  });

  Promise.all(promises).then(function(newData) {
    let allData = {}, newList = [];

    // Merge old fetched data with the new one, since we may have
    // done a partial fetch this time
    oldComponentsData.concat(newData).forEach(function(c) {
      if (c) allData[c.name] = c;
    });

    // Convert back to an array and make sure we ignore rejects
    Object.keys(allData).forEach(function(key) {
      if (!rejectedComponents[key]) newList.push(allData[key]);
    });

    // Persist the new metadata
    let str = JSON.stringify(newList);
    fs.writeFile(componentsDataFile, str);

    // Persist the new docs
    str = JSON.stringify(docs);
    fs.writeFile(docsFile, str);

    // Persist updates done to attributes of components file (repo, description)
    str = JSON.stringify(components, null, '  ');
    fs.writeFile(componentsFile, str);

    callback();
  });
}

// If being executed from the command-line
if (!module.parent) {
  require('colors');

  // Pass the components list you which to update ("react-web" or "react-native")
  // and optionally an index to make a partial update to the data file.
  // Example usage: `npm run fetch react-web 2`
  let type = process.argv[2] || "react-native";
  let batchIndex = process.argv[3];
  let batchSize = 50; // 50 is the size of the batch that will be updated

  let errors = [];
  let warnings = [];
  let error = (ref, msg) => errors.push(`\`${ ref }\`: ${ msg }`);
  let warn = (ref, msg) => warnings.push(`\`${ ref }\`: ${ msg }`);

  let options = { batchIndex, batchSize, error, warn };

  fetch(type, function() {
    if (!errors.length) {
      console.log("\nSuccess!".green);
    } else {
      console.log("\nErrors:".red);
      errors.forEach((msg) => console.log(msg));
    }
    if (warnings.length) {
      console.log("\nWarnings:".yellow);
      warnings.forEach((msg) => console.log(msg));
    }
  }, options);
}

module.exports = fetch;
