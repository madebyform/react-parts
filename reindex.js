/*jshint node:true, unused:true */
var ent = require('ent');
var keys = require('./keys.json');
var algoliasearch = require('algoliasearch');
var client = algoliasearch(keys.algolia.appId, keys.algolia.writeAPIKey);

function arrayChunk(list, chunkSize) {
  var chunks = [];
  var max = list.length;
  var i = 0;

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
    // There currently is an issue in the way the Algolia API handle HTML chars
    // in the _highlightResult attribute. All htmlencoded data gets decoded, so
    // we need to encode it twice to get the correct display.
    record.description_encoded = ent.encode(ent.encode(record.description || ''));
    return record;
  });
}

function promiseLog(text) {
  return function(req) {
    console.info(text);
    return req;
  };
}

function pushDataToAlgolia(sources) {
  var indexName = 'reactparts';
  var indexNameTmp = indexName + '_tmp';
  var indexNameSlave = indexName + '_slave';
  var indexTmp = client.initIndex(indexNameTmp);
  var indexSlave = client.initIndex(indexNameSlave);

  var indexSettings = {
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
      'homepage',
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
    ranking: [
      // Similar to the default ranking but "custom" is in second instead of last. Eg:
      // - If the query `video` is matched in both name and keywords in 1 record, and
      //   only in the name in another, we still want the one with more stars on top.
      // - If `card` matches `react-card` with 10 stars and `react-carousel` with 100,
      //   we want the one with 0 typos on top.
      "typo",
      "custom",
      "words",
      "proximity",
      "attribute",
      "exact"
    ],
    customRanking: [
      'desc(stars)',
      'desc(downloads)',
      'desc(modified)'
    ],
    minWordSizefor1Typo: 3,
    minWordSizefor2Typos: 7,
    hitsPerPage: 20,
    highlightPreTag: '<mark>',
    highlightPostTag: '</mark>'
  };

  // Create a slave index that is sorted by `modified`
  var indexSlaveSettings = Object.assign({}, indexSettings);
  indexSlaveSettings.customRanking = ['desc(modified)'];

  // To be able to move the master index, the slave was configured on the site
  // indexSettings.slaves = [ indexNameSlave ];

  var allRecords = [];
  sources.forEach(function(source) {
    var records = require(source.file);
    var type = source.type;
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
  var pushOrders = [];

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

pushDataToAlgolia([
  {
    file: './data/react-web.json',
    type: 'web'
  }, {
    file: './data/react-native.json',
    type: 'native'
  }
]);
