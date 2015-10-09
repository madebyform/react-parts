/*jshint esnext:true, node:true */
'use strict';

let algoliaSearch = require('algoliasearch');
let algoliaAppId = 'POLDBPK8LK';
let algoliaSearchAPIKey = 'e23f93113f47b926771abfcf68496ef5';
let algoliaClient = algoliaSearch(algoliaAppId, algoliaSearchAPIKey);
let algoliaIndex;
let algoliaSlaveIndex;

function getSearchResults({ query, type, page, perPage, production }) {
  let searchConfig = {
    facets: ['type'],
    facetFilters: ['type:' + type],
    hitsPerPage: perPage,
    page: page
  };

  if (!algoliaIndex) {
    let indexName = `reactparts${ production ? "" : "_dev" }`;
    algoliaIndex = algoliaClient.initIndex(indexName);
    algoliaSlaveIndex = algoliaClient.initIndex(`${ indexName }_slave`);
  }

  // If there isn't a query, use the slave index which is sorted by `modified`
  let index = query ? algoliaIndex : algoliaSlaveIndex;

  return index.search(query, searchConfig).then(function(data) {
    // Search results
    let searchResults = data.hits.map(function(hit) {
      hit.modified = new Date(hit.modified).toISOString();
      hit.name_highlight = hit._highlightResult.name.value;
      hit.description_highlight = hit._highlightResult.description_encoded.value;
      hit.githubUser_highlight = hit._highlightResult.githubUser.value;
      delete hit._highlightResult;
      return hit;
    });

    return {
      components: searchResults,
      searchCount: data.nbHits,
      page: data.page
    };
  });
}

export default getSearchResults;
