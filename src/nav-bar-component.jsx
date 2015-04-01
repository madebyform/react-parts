/*jshint esnext:true, browserify:true, unused:true */
'use strict';

import React from 'react/addons';
import StylingMixin from './styling-mixin.jsx';

let PureRenderMixin = React.addons.PureRenderMixin;

let NavBar = React.createClass({
  mixins: [StylingMixin, PureRenderMixin],
  propTypes: {
    title: React.PropTypes.string.isRequired,
    height: React.PropTypes.string.isRequired,
    onSearch: React.PropTypes.func
  },
  getDefaultProps() {
    return {
      onSearch() {}
    };
  },
  render() {
    let styles = {
      container: {
        alignItems: "center",
        background: "#05a5d1",
        boxShadow: "0 -8px 4px 10px rgba(0,0,0,.2)",
        boxSizing: "border-box",
        color: "#fff",
        display: "flex",
        height: this.props.height,
        padding: this.remCalc(0, 20)
      },
      titleArea: {
        WebkitBoxFlex: 1,
        flex: 1,
        lineHeight: this.props.height,
        minWidth: this.remCalc(180)
      },
      logo: {
        height: "1em",
        paddingRight: this.remCalc(10),
        verticalAlign: "-0.05em",
        width: "1em"
      },
      title: {
        fontSize: this.remCalc(26),
        fontWeight: 600
      },
      center: {
        alignItems: "center",
        WebkitBoxFlex: 1,
        flex: 1,
        flexGrow: 4,
        justifyContent: "center",
        margin: this.remCalc(10),
        maxWidth: this.remCalc(800)
      },
      search: {
        background: "rgba(255,255,255, .15)",
        border: "none",
        borderRadius: "2px",
        boxSizing: "border-box",
        fontSize: this.remCalc(16),
        outline: "none",
        padding: this.remCalc(8, 10),
        width: "100%"
      },
      link: {
        color: "#fff",
        WebkitBoxFlex: 1,
        flex: 1,
        margin: this.remCalc(12, 0),
        minWidth: this.remCalc(180),
        display: "block",
        textAlign: "right",
        textDecoration: "none"
      }
    };
    return (
      <div className="NavBar" style={styles.container}>
        <div style={styles.titleArea}>
          <img style={styles.logo} src="logo.svg" alt="Logo" />
          <span style={styles.title}>{this.props.title}</span>
        </div>
        <div style={styles.center}>
          <input
            ref="search"
            style={styles.search}
            type="text"
            placeholder="Search"
            onKeyUp={this.handleKeyUp}
          />
        </div>
        <a href="/submit" style={styles.link}>
          Submit a component
        </a>
      </div>
    );
  },
  handleKeyUp() {
    var field = React.findDOMNode(this.refs.search);
    var value = field.value.trim();
    this.props.onSearch(value);
  }
});

export default NavBar;
