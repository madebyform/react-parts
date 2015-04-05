/*jshint esnext:true, browserify:true, unused:true */
'use strict';

import React from 'react/addons';
import Router from 'react-router';
import StylingMixin from './styling-mixin.jsx';

let Link = Router.Link;

export let Tab = React.createClass({
  mixins: [StylingMixin],
  render() {
    let styles = {
      tab: {
        WebkitBoxFlex: 1,
        flex: 1,
        textAlign: "center",
        textTransform: "uppercase",
        letterSpacing: this.remCalc(1),
        textDecoration: "none",
        color: "#828282"
      },
      selectedTab: {
        color: "#05a5d1",
      }
    };
    return (
      <Link
        {...this.props}
        style={styles.tab}
        activeStyle={this.mergeStyles(
          styles.tab,
          styles.selectedTab
        )}>
          {this.props.children}
      </Link>
    );
  }
});

export let Tabs = React.createClass({
  mixins: [StylingMixin],
  render() {
    let styles = {
      container: {
        background: "#fff",
        boxShadow: "0 1px 2px rgba(0,0,0,.2)",
        margin: 1,
        padding: this.remCalc(15, 20),
        display: "flex",
      },
    };
    return (
      <div style={styles.container} className="Tabs">
        {this.props.children}
      </div>
    );
  }
});
