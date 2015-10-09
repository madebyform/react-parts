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
import getSearchResults from './get-search-results';

let Route = Router.Route;
let RouteHandler = Router.RouteHandler;

export var App = React.createClass({
  mixins: [StylingMixin],
  contextTypes: {
    router: React.PropTypes.func
  },
  propTypes: {
    params: React.PropTypes.object.isRequired,
    query: React.PropTypes.object.isRequired,
    initialComponents: React.PropTypes.array.isRequired,
    initialCount: React.PropTypes.number.isRequired,
    perPage: React.PropTypes.number.isRequired,
    debugMode: React.PropTypes.bool.isRequired,
  },
  getInitialState() {
    return {
      components: this.props.initialComponents,
      count: this.props.initialCount
    };
  },
  render() {
    let title = "React.parts";
    let type = this.props.params.type;
    let search = this.props.query.search;
    let searchInputQuery = search ? decodeURIComponent(search) : null;
    let components = this.state.components;
    let debugMode = this.props.debugMode;

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
      <Scroller className="u-scrollable" position={debugMode ? "same" : "top"} style={styles.container}>
        <Navbar
          title={title}
          height={this.remCalc(55)}
          onSearch={this.handleSearchInput}
          defaultValue={searchInputQuery}
        />

        <div style={styles.content}>
          <Tabs>
            <Tab to="components" params={{type: "native"}} query={{search}}>React Native</Tab>
            <Tab to="components" params={{type: "web"}} query={{search}}>React for Web</Tab>
          </Tabs>

          <RouteHandler
            components={components}
            debugMode={debugMode}
            loading={this.state.loading}
          />

          <Pagination
            to="components"
            params={this.props.params}
            query={this.props.query}
            currentPage={this.parsePage(this.props.query.page)}
            perPage={this.props.perPage}
            totalItems={this.state.count}
          />

          <Footer />
        </div>

        <Twitter />
      </Scroller>
    );
  },
  componentWillReceiveProps(newProps) {
    this.performSearch({
      query: newProps.query.search,
      type: newProps.params.type,
      page: this.parsePage(newProps.query.page) - 1, // In Algolia, pagination starts with 0
      perPage: newProps.perPage,
      production: !newProps.debugMode
    });
  },
  handleSearchInput(searchQuery) {
    let queryParams = {};
    if (searchQuery) queryParams.search = searchQuery;
    this.context.router.transitionTo("/:type", this.props.params, queryParams);
  },
  performSearch(searchOptions) {
    // Clear the list and display loading message
    this.setState({ components: [], count: 0, loading: true });

    getSearchResults(searchOptions).then((data) => {
      this.setState({
        components: data.components,
        count: data.searchCount,
        loading: false
      });
    });
  },
  parsePage(page) {
    return Math.max(1, parseInt(page, 10) || 1);
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
