/*jshint esnext:true, browserify:true, unused:true */
'use strict';

import React from 'react/addons';
import StylingMixin from './styling-mixin.jsx';

let PureRenderMixin = React.addons.PureRenderMixin;

let Navbar = React.createClass({
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
        background: "#253b6b",
        boxSizing: "border-box",
        color: "#fff",
        display: "flex",
        height: this.props.height,
        overflow: "hidden"
      },
      left: {
        WebkitBoxFlex: 1,
        flex: 1
      },
      logo: {
        float: "right",
        height: this.remCalc(62),
        width: this.remCalc(62)
      },
      center: {
        WebkitBoxFlex: 1,
        alignItems: "center",
        background: "#4b67a5 url(/search.svg) no-repeat 16px center",
        backgroundSize: "auto 100%",
        flex: 1,
        flexGrow: 4,
        height: "100%",
        justifyContent: "center",
        marginLeft: this.remCalc(12),
        maxWidth: this.remCalc(800),
        paddingRight: this.remCalc(10)
      },
      search: {
        background: "transparent",
        border: "none",
        boxSizing: "border-box",
        fontSize: this.remCalc(19),
        height: "100%",
        outline: "none",
        paddingBottom: this.remCalc(4),
        paddingLeft: this.remCalc(50),
        width: "100%"
      },
      right: {
        WebkitBoxFlex: 1,
        background: "#4b67a5",
        height: "100%",
        flex: 1
      },
      link: {
        background: "#253b6b",
        borderRadius: this.remCalc(2),
        boxSizing: "border-box",
        color: "#fff",
        display: "block",
        float: "right",
        fontSize: this.remCalc(17),
        fontWeight: 200,
        margin: this.remCalc(7),
        minWidth: this.remCalc(186),
        padding: this.remCalc(8, 20),
        textAlign: "center",
        textDecoration: "none"
      }
    };
    return (
      <div className="Navbar" style={styles.container}>
        <div style={styles.left}>
          <a href="/">
            <img style={styles.logo} src="/react-logo.svg" alt="Logo" draggable="false" />
          </a>
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
        <div style={styles.right}>
          <a className="u-hideSmall" style={styles.link} href="/submit">
            Submit a component
          </a>
        </div>
      </div>
    );
  },
  handleKeyUp() {
    var field = React.findDOMNode(this.refs.search);
    var value = field.value.trim();
    this.props.onSearch(value);
  }
});

export default Navbar;
