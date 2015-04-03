/*jshint esnext:true, browserify:true, unused:true */
'use strict';

import React from 'react/addons';
import StylingMixin from './styling-mixin.jsx';

let PureRenderMixin = React.addons.PureRenderMixin;

export let Tab = React.createClass({
  mixins: [StylingMixin, PureRenderMixin],
  propTypes: {
    url: React.PropTypes.string.isRequired,
    title: React.PropTypes.string.isRequired,
    selected: React.PropTypes.bool,
  },
  getDefaultProps() {
    return {
      selected: false,
    };
  },
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
      <a href={this.props.url}
         style={this.mergeStyles(styles.tab, this.props.selected && styles.selectedTab)}>
        {this.props.title}
      </a>
    );
  }
});

export let Tabs = React.createClass({
  mixins: [StylingMixin, PureRenderMixin],
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
