/*jshint esnext:true, browserify:true, unused:true */
'use strict';

import React from 'react/addons';
import {Link} from 'react-router';
import StylingMixin from '../helpers/styling-mixin.jsx';

export let Tab = React.createClass({
  mixins: [StylingMixin],
  propTypes: {
    disabled: React.PropTypes.bool
  },
  getDefaultProps() {
    return {
      disabled: false
    };
  },
  render() {
    let styles = {
      tab: {
        WebkitBoxFlex: 1,
        flex: 1,
        MozUserSelect: "none",
        WebkitUserSelect: "none",
        color: "#4b67a5",
        display: "block",
        fontSize: this.remCalc(20),
        letterSpacing: this.remCalc(0),
        padding: this.remCalc(10, 10, 11),
        textAlign: "center",
        textDecoration: "none"
      },
      selectedTab: {
        background: "#fff",
        fontWeight: 600
      },
      disabledTab: {
        color: "#aaa",
        fontWeight: 300
      }
    };
    if (!this.props.disabled) {
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
    } else {
      return (
        <div style={this.mergeStyles(
          styles.tab,
          styles.disabledTab
        )}>
          {this.props.children}
        </div>
      );
    }
  }
});

export let Tabs = React.createClass({
  mixins: [StylingMixin],
  render() {
    let styles = {
      container: {
        background: "#f7f8fa",
        display: "flex; display: -webkit-box; display: -webkit-flex",
        margin: 1
      },
    };
    return (
      <div style={styles.container}>
        {this.props.children}
      </div>
    );
  }
});
