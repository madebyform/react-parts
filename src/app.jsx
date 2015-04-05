/*jshint esnext:true, browserify:true */
'use strict';

import 'babel/polyfill';
import React from 'react/addons';

import StylingMixin from './styling-mixin.jsx';
import NavBar from './nav-bar-component.jsx';
import ComponentList from './list-component.jsx';
import {Tabs, Tab} from './tabs-component.jsx';

let PureRenderMixin = React.addons.PureRenderMixin;

export var App = React.createClass({
  mixins: [StylingMixin, PureRenderMixin],

  tabs: [{
      url: "/native-ios",
      title: "React Native"
    },
    {
      url: "/web",
      title: "React Web"
    }
  ],

  getInitialState() {
    return {
      components: this.props.components
    };
  },
  render() {
    let title = "React.parts";
    let list = this.state.components;

    let styles = {
      container:  {
        fontFamily: "Source Sans Pro, monospace",
        fontSize: this.remCalc(20),
        lineHeight: "1.5",
        cursor: "default"
      },
      title: {
        textAlign: "center"
      },
      content: {
        margin: "0 auto",
        fontSize: this.remCalc(17),
        maxWidth: this.remCalc(800),
        padding: this.remCalc(10)
      },
      footer: {
        color: "#999",
        fontSize: this.remCalc(16),
        fontWeight: 200,
        margin: this.remCalc(30, 0),
        textAlign: "center"
      },
      author: {
        color: "#3949ab",
        fontWeight: "bold",
        textDecoration: "none"
      }
    };

    // Mark selected tab and map to Tab component instances
    let tabs = this.tabs.map( (tab, index) => {
      let selected = this.props.currentPath === tab.url;
      return <Tab url={tab.url} title={tab.title} selected={selected} key={index} />;
    });

    return (
      <div style={styles.container}>
        <NavBar title={title} height={this.remCalc(55)} onSearch={this.handleSearch} />

        <div style={styles.content}>
          <h2 style={styles.title}>A catalog of React components</h2>
          <Tabs>{tabs}</Tabs>
          <ComponentList components={list} />

          <p style={styles.footer}>
            React, React Native and logos are copyright of Facebook.
            This page is not affiliated with Facebook.<br/>
            <a style={styles.author} href="http://madebyform.com">Made by Form</a>
          </p>
        </div>
      </div>
    );
  },
  handleSearch(value) {
    let filtered = this.props.components.filter((c) => c.name.indexOf(value) != -1 || c.description.indexOf(value) != -1);
    this.setState({ components: filtered });
  }
});

if (typeof(document) !== "undefined") {
  let currentPath = window.location.pathname;
  React.render(
    <App components={window.components} currentPath={currentPath} />,
    document.getElementById("container")
  );
}
