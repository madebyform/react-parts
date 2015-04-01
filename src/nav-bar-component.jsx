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
        padding: this.remCalc(20)
      },
      titleArea: {
        flex: 1,
        lineHeight: this.props.height,
        minWidth: this.remCalc(150)
      },
      title: {
        fontSize: this.remCalc(26),
        fontWeight: 600
      },
      center: {
        alignItems: "center",
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
        flex: 1,
        minWidth: this.remCalc(180),
        textAlign: "right",
        textDecoration: "none"
      }
    };
    return (
      <div className="NavBar" style={styles.container}>
        <div style={styles.titleArea}>
          <span style={styles.title}>{this.props.title}</span>
        </div>
        <div style={styles.center}>
          <input
            style={styles.search}
            type="text"
            placeholder="Search"
          />
        </div>
        <a href="/submit" style={styles.link}>
          Submit a component
        </a>
      </div>
    );
  }
});

export default NavBar;
