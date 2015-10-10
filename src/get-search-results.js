/*jshint esnext:true, node:true */
'use strict';

// Be sure your Algolia API key is allowed the following operations: "Search", "Browse Index"
// It should be able to interact with all indices that match: "reactparts*"

let algoliaSearch = require('algoliasearch');
let algoliaAppId = 'POLDBPK8LK';
let algoliaSearchAPIKey = 'e23f93113f47b926771abfcf68496ef5';
let algoliaClient = algoliaSearch(algoliaAppId, algoliaSearchAPIKey);
let algoliaIndex;
let algoliaSlaveIndex;
let cachedComponents = {};

function getSearchResults({ query, type, page, perPage, production }, callback) {
  let searchConfig = {
    facets: ['type'],
    facetFilters: ['type:' + type],
    hitsPerPage: perPage,
    page: page
  };

  // If this is the first time the function is being called, choose the indexes
  // There is always a master and a slave. There's 2 per environment (prod and dev)
  if (!algoliaIndex) {
    let indexName = `reactparts${ production ? "" : "_dev" }`;
    algoliaIndex = algoliaClient.initIndex(indexName);
    algoliaSlaveIndex = algoliaClient.initIndex(`${ indexName }_slave`);
  }

  // If there isn't a query, it means the user is browsing the catalog
  // so use the slave index, which is sorted by `modified`.
  // Otherwise, use the master index that is sorted by relevance.
  let index = query ? algoliaIndex : algoliaSlaveIndex;

  // If the user is searching, or is browsing through the first 1000 records,
  // we can use algolia's `search` API
  if (query || perPage*(page+1) <= 1000) {
    if (!production) console.log("[search] Performing query");

    return index.search(query, searchConfig).then(function(data) {
      let searchResults = data.hits.map(function(hit) {
        hit.modified = new Date(hit.modified).toISOString();
        hit.nameHighlight = hit._highlightResult.name.value;
        hit.descriptionHighlight = hit._highlightResult.description_encoded.value;
        hit.githubUserHighlight = hit._highlightResult.githubUser.value;
        delete hit._highlightResult;
        return hit;
      });

      // If the user is searching, results are limited to 1000.
      // `data.nbHits` can still be <1000, so change that to ensure pagination works
      let searchCount = query ? Math.min(1000, data.nbHits) : data.nbHits;

      callback({
        components: searchResults,
        searchCount: searchCount,
        page: data.page
      });
    });


  // Algolia's `search` API only fetches at most 1000 hits. So if the user is browsing
  // the entire catalog, we use one of the `browse` API methods instead.
  // Using the `browse` methods on the client-side requires HTTPS.
  // In develop, you can setup something like this: https://github.com/jugyo/tunnels
  } else {
    if (!production) console.log("[browse] Performing query");

    // The `browse` method is similar to `search` but requires you to pass a `cursor`
    // after the first 1000 records. Since the user may go to a random page instead of
    // going sequently (by visiting an URL directly), we need to retrieve the entire set.

    let sliceResults = function(components) {
      return components.slice(page * perPage, page * perPage + perPage);
    };

    // If the result as been cached
    if (cachedComponents[type]) {
      if (!production) console.log("[browse] Using cache");

      callback({
        components: sliceResults(cachedComponents[type]),
        searchCount: cachedComponents[type].length,
        page: page
      });
    } else {
      let config = { facets: ['type'], facetFilters: ['type:' + type] };
      let browser = index.browseAll("", config);
      let hits = [];

      browser.on('result', function onResult(content) {
        hits = hits.concat(content.hits);
      });

      browser.on('end', function onEnd() {
        if (!production) console.log(`[browse] We got ${ hits.length } records`);

        cachedComponents[type] = hits.map(function(hit) {
          hit.modified = new Date(hit.modified).toISOString();
          return hit;
        });

        callback({
          components: sliceResults(cachedComponents[type]),
          searchCount: cachedComponents[type].length,
          page: page
        });
      });

      browser.on('error', function onError(err) {
        throw err;
      });
    }
  }
}

export default getSearchResults;
