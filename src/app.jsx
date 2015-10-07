/*jshint esnext:true, browserify:true */
'use strict';

import 'babel/polyfill';
import 'isomorphic-fetch';
import React from 'react/addons';
import Router from 'react-router';
import StylingMixin from './styling-mixin.jsx';
import Navbar from './navbar-component.jsx';
import ComponentList from './list-component.jsx';
import {Tabs, Tab} from './tabs-component.jsx';
import Pagination from './pagination-component.jsx';
import Scroller from './scroller-component.jsx';
import Footer from './footer-component.jsx';
import Twitter from './twitter-component.jsx';
import getSearchResults from './get-search-results'
import sortBy from './sort';

let Route = Router.Route;
let RouteHandler = Router.RouteHandler;

export var App = React.createClass({
  mixins: [StylingMixin],
  contextTypes: {
    router: React.PropTypes.func
  },
  propTypes: {
    components: React.PropTypes.array.isRequired,
    currentPage: React.PropTypes.number,
    debugMode: React.PropTypes.bool,
    searchQuery: React.PropTypes.string,
    searchCount: React.PropTypes.number,
    type: React.PropTypes.string
  },
  getDefaultProps() {
    return {
      currentPage: 0,
      debugMode: false,
      perPage: 20
    };
  },
  getInitialState() {
    return {
      components: this.props.components,
      currentPage: this.props.currentPage,
      searchQuery: this.props.searchQuery,
      searchCount: this.props.searchCount,
      type: this.props.type
    };
  },
  render() {
    let title = "React.parts";
    let type = this.state.type;
    let components = this.state.components;
    let searchCount = this.state.searchCount;
    let debugMode = this.props.debugMode;
    let loading = this.state.loading;

    let styles = {
      container:  {
        fontFamily: "Source Sans Pro, sans-serif",
        fontSize: this.remCalc(20),
        lineHeight: "1.5",
        cursor: "default"
      },
      content: {
        margin: "0 auto",
        fontSize: this.remCalc(15),
        maxWidth: this.remCalc(710),
        padding: this.remCalc(50, 10, 10)
      }
    };
    return (
      <Scroller className="u-scrollable" position={ debugMode ? "same" : "top" } style={styles.container}>
        <Navbar title={title} height={this.remCalc(55)} onSearch={this.handleSearch} />

        <div style={styles.content}>
          <Tabs>
            <Tab to="components" params={{type: "native"}}>React Native</Tab>
            <Tab to="components" params={{type: "web"}}>React for Web</Tab>
          </Tabs>

          <RouteHandler
            components={components}
            debugMode={debugMode}
            loading={loading}
          />

          <Pagination
            to="components"
            params={{ type }}
            currentPage={this.state.currentPage}
            perPage={this.props.perPage}
            searchCount={searchCount}
          />

          <Footer />
        </div>
        <Twitter />

      </Scroller>
    );
  },
  componentWillReceiveProps(newProps) {
    var searchQuery = this.state.searchQuery;
    var currentType = this.state.type;
    var newType = newProps.params.type;
    var type = newType || currentType
    var page = newProps.query.page || this.state.currentPage;

    // Revert to first page if switching type
    if (newType !== currentType) {
      page = 0;
    }

    this.handleSearch({ searchQuery, type, page});
  },
  handleSearch({searchQuery = '', type = this.state.type, page = this.state.currentPage}) {
    var searchOptions = {
      query: searchQuery,
      type: type,
      page: page,
      perPage: this.props.perPage
    }
    getSearchResults(searchOptions).then((data) => {
      this.setState({ 
        type: type,
        searchQuery: searchQuery,
        components: data.components,
        searchCount: data.searchCount,
        currentPage: data.page
      });
    });
  },
  currentPage() {
    var currentPage = parseInt(this.props.query.page); // May return NaN
    if (isNaN(currentPage)) currentPage = 1; // This works, even for 0
    return currentPage;
  }
});

export var routes = (
  <Route name="app" path="/" handler={App}>
    <Route name="components" path=":type" handler={ComponentList} />
  </Route>
);

if (typeof(document) !== "undefined") {
  Router.run(routes, Router.HistoryLocation, function(Handler, state) {
    React.render(
      <Handler {...state} {...window.initialData} />,
      document.getElementById("container")
    );
  });
}
