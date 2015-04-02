/*jshint esnext:true, browserify:true */
/*globals components */
'use strict';

import 'babel/polyfill';
import React from 'react/addons';

import StylingMixin from './styling-mixin.jsx';
import NavBar from './nav-bar-component.jsx';
import ComponentList from './list-component.jsx';

let PureRenderMixin = React.addons.PureRenderMixin;

export var App = React.createClass({
  mixins: [StylingMixin, PureRenderMixin],
  getInitialState() {
    return { components };
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
    return (
      <div style={styles.container}>
        <NavBar title={title} height={this.remCalc(55)} onSearch={this.handleSearch} />

        <div style={styles.content}>
          <h2 style={styles.title}>A catalog of React Native components</h2>
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
    let filtered = components.filter((c) => c.name.indexOf(value) != -1);
    this.setState({ components: filtered });
  }
});

if (typeof(document) !== "undefined") {
  React.render(<App />, document.getElementById("container"));
}
