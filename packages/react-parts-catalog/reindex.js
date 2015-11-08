/*jshint esnext:true, node:true, unused:true */
'use strict';

let ent = require('ent');
let path = require('path');
let algoliasearch = require('algoliasearch');
let keys = require("./keys.json");
let client = algoliasearch(keys.algolia.appId, keys.algolia.writeAPIKey);

function arrayChunk(list, chunkSize) {
  let chunks = [];
  let max = list.length;
  let i = 0;

  while (i < max) {
    chunks.push(list.slice(i, i += chunkSize));
  }
  return chunks;
}

function stringDateToUnixTimestamp(date) {
  return Math.floor(new Date(date).getTime());
}

function formatRecordsForSearch(records, type) {
  return records.map(function(record) {
    record.type = type;
    record.keywords = record.keywords.split(',');
    record.modified = stringDateToUnixTimestamp(record.modified);
    record.description = ent.encode(record.description || ''); // For browsing
    // There currently is an issue in the way the Algolia API handle HTML chars
    // in the _highlightResult attribute. All htmlencoded data gets decoded, so
    // we need to encode it twice to get the correct display.
    record.description_encoded = ent.encode(record.description); // For searching (w/ highlights)
    return record;
  });
}

function promiseLog(text) {
  return function(req) {
    console.info(text);
    return req;
  };
}

function pushDataToAlgolia(env, sources) {
  sources = sources || [{
    file: path.resolve(__dirname, './data/react-web.json'),
    type: 'web'
  }, {
    file: path.resolve(__dirname, './data/react-native.json'),
    type: 'native'
  }];

  let indexName = `reactparts${ env === "production" ? "" : "_dev" }`;
  let indexNameTmp = indexName + '_tmp';
  let indexNameSlave = indexName + '_slave';
  let indexTmp = client.initIndex(indexNameTmp);
  let indexSlave = client.initIndex(indexNameSlave);

  let indexSettings = {
    attributesToIndex: [
      'unordered(name)',
      'unordered(description)',
      'unordered(keywords)',
      'githubUser',
      'repo,homepage',
      'description_encoded' // To have highlight in it
    ],
    attributesToRetrieve: [
      'description',
      'description_encoded',
      'downloads',
      'githubUser',
      'githubName',
      'latestVersion',
      'modified',
      'name',
      'platforms',
      'stars'
    ],
    attributesForFacetting: [
      'type',
      'keywords',
      'githubUser'
    ],
    // Disable the exact criterion when there is only one word
    useQueryEqualsOneAttributeInRanking: false,
    customRanking: [
      'desc(stars)',
      'desc(downloads)',
      'desc(modified)'
    ],
    queryType: "prefixAll",
    minWordSizefor1Typo: 4,
    minWordSizefor2Typos: 7,
    hitsPerPage: 20,
    highlightPreTag: '<mark>',
    highlightPostTag: '</mark>'
  };

  // Create a slave index that is sorted by `modified`
  let indexSlaveSettings = Object.assign({}, indexSettings);
  indexSlaveSettings.customRanking = ['desc(modified)'];

  // To be able to move the master index, the slave was configured on the site
  // indexSettings.slaves = [ indexNameSlave ];

  let allRecords = [];
  sources.forEach(function(source) {
    let records = require(source.file);
    let type = source.type;
    allRecords = allRecords.concat(formatRecordsForSearch(records, type));
  });

  return configureIndex(indexTmp, indexSettings)
    .then(promiseLog('[' + indexNameTmp +']: Configured index'))
    .then(configureIndex(indexSlave, indexSlaveSettings))
    .then(promiseLog('[' + indexNameTmp +']: Configured slave index'))
    .then(pushRecords(allRecords, indexTmp))
    .then(promiseLog('[' + indexNameTmp +']: Pushed all chunks'))
    .then(overwriteTmpIndex(client, indexNameTmp, indexName))
    .then(promiseLog('[' + indexNameTmp +']: Delete tmp index'))
    .catch(console.log);
}

function configureIndex(index, settings) {
  return index.setSettings(settings);
}

function pushRecords(records, index) {
  let pushOrders = [];

  arrayChunk(records, 500).forEach(function(chunkedRecords) {
    pushOrders.push(index.addObjects(chunkedRecords));
  });

  return function() {
    return Promise.all(pushOrders);
  };
}

// Replace the real index with the temporary one
// Allow for atomic updates
function overwriteTmpIndex(client, indexNameTmp, indexName) {
  return function() {
    return client.moveIndex(indexNameTmp, indexName)
      .then(client.deleteIndex(indexNameTmp));
  };
}

// If being executed from the command-line
if (!module.parent) {
  let readlineSync = require('readline-sync');
  let env = process.argv[2];

  if (env === "production" && !readlineSync.keyInYN("Are you sure you want to update the production index?")) {
    process.exit();
  }

  pushDataToAlgolia(env);
}

module.exports = pushDataToAlgolia;
