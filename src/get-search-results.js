/*jshint esnext:true, node:true */
'use strict';
var AlgoliaSearch = require('algoliasearch');
var algoliaAppId = 'POLDBPK8LK';
var algoliaSearchAPIKey = 'e23f93113f47b926771abfcf68496ef5';
var AlgoliaClient = AlgoliaSearch(algoliaAppId, algoliaSearchAPIKey);
var AlgoliaIndex = AlgoliaClient.initIndex('reactparts');

function getSearchResults({ query = '', type = 'native', page = 0, perPage = 20 }) {
  var searchConfig = {
    facets: ['type'],
    facetFilters: ['type:' + type],
    hitsPerPage: perPage,
    page: page
  };

  return AlgoliaIndex.search(query, searchConfig).then(function(data) {
    // Search results
    var searchResults = data.hits.map(function(hit) {
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
    }
  });
}

export default getSearchResults;

