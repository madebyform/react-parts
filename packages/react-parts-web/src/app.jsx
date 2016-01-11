/*jshint esnext:true, browserify:true */
'use strict';

import 'babel/polyfill';
import React from 'react/addons';
import Router from 'react-router';
import StylingMixin from './helpers/styling-mixin.jsx';
import getSearchResults from './helpers/get-search-results';
import Navbar from './components/navbar-component.jsx';
import ComponentList from './components/list-component.jsx';
import {Tabs, Tab} from './components/tabs-component.jsx';
import Pagination from './components/pagination-component.jsx';
import Footer from './components/footer-component.jsx';
import Twitter from './components/twitter-component.jsx';
import DeprecationNotice from './components/deprecation-notice-component.jsx';

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
    perPage: React.PropTypes.number.isRequired
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

    let styles = {
      container:  {
        cursor: "default",
        fontFamily: "Source Sans Pro, sans-serif",
        fontSize: this.remCalc(20),
        lineHeight: "1.5",
        width: "100%"
      },
      content: {
        margin: "0 auto",
        fontSize: this.remCalc(15),
        maxWidth: this.remCalc(710),
        padding: this.remCalc(50, 10, 10)
      }
    };
    return (
      <div style={styles.container}>
        <DeprecationNotice />

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
      </div>
    );
  },
  componentWillReceiveProps(newProps) {
    this.performSearch({
      query: newProps.query.search,
      type: newProps.params.type,
      page: this.parsePage(newProps.query.page) - 1, // In Algolia, pagination starts with 0
      perPage: newProps.perPage
    });
  },
  componentDidUpdate(prevProps, prevState) {
    let pageChanged = prevProps.query.page != this.props.query.page;
    let searchChanged = prevProps.query.search != this.props.query.search;

    // If the current page or the search query changed, scroll to the top
    if (pageChanged || searchChanged) {
      window.scrollTo(0, 0);
    }
  },
  handleSearchInput(searchQuery) {
    let queryParams = Object.assign({}, this.props.query);
    delete queryParams.page; // Reset the current page
    delete queryParams.search; // Reset the current search query if it exists
    if (searchQuery) queryParams.search = searchQuery; // Set the new search query

    this.context.router.transitionTo("/:type", this.props.params, queryParams);
  },
  performSearch(searchOptions) {
    // Clear the list and display loading message
    this.setState({ components: [], count: 0, loading: true });

    getSearchResults(searchOptions, (data) => {
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
