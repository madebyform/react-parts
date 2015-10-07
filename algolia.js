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
    record.created = stringDateToUnixTimestamp(record.created);
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
  var indexTmp = client.initIndex(indexNameTmp);

  var allRecords = [];
  sources.forEach(function(source) {
    var records = require(source.file);
    var type = source.type;
    allRecords = allRecords.concat(formatRecordsForSearch(records, type));
  });

  return configureIndex(indexTmp)
    .then(promiseLog('[' + indexNameTmp +']: Configured index'))
    .then(pushRecords(allRecords, indexTmp))
    .then(promiseLog('[' + indexNameTmp +']: Pushed all chunks'))
    .then(overwriteTmpIndex(client, indexNameTmp, indexName))
    .then(promiseLog('[' + indexNameTmp +']: Delete tmp index'));
}

function configureIndex(index) {
  return index.setSettings({
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
    customRanking: [
      'desc(stars)',
      'desc(downloads)',
      'desc(modified)',
      'desc(created)'
    ],
    minWordSizefor1Typo: 3,
    minWordSizefor2Typos: 7,
    hitsPerPage: 20,
    highlightPreTag: '<mark>',
    highlightPostTag: '</mark>'
  });
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
