/*jshint esnext:true, browserify:true, unused:true */
'use strict';

import React from 'react/addons';
import StylingMixin from '../helpers/styling-mixin.jsx';
import Icon from './icon-component.jsx';

let PureRenderMixin = React.addons.PureRenderMixin;

let DeprecationNotice = React.createClass({
  mixins: [StylingMixin, PureRenderMixin],
  getInitialState() {
    return {
      open: true
    };
  },
  render() {
    let styles = {
      container: {
        background: "#000",
        fontSize: this.remCalc(18),
        fontWeight: 300,
        letterSpacing: this.remCalc(0.2),
        textAlign: "center",
        wordSpacing: this.remCalc(0.3)
      },
      content: {
        color: "#fff",
        display: "block",
        padding: this.remCalc(14, 10),
        textDecoration: "none",
        width: "100%"
      },
      link: {
        borderBottom: "1px solid #666",
        fontWeight: 400
      },
      close: {
        background: "#999",
        border: "none",
        borderRadius: "50%",
        color: "#000",
        display: "block",
        fontSize: this.remCalc(24),
        height: this.remCalc(24),
        lineHeight: 1,
        padding: 0,
        position: "absolute",
        right: this.remCalc(15),
        textDecoration: "none",
        top: this.remCalc(15),
        width: this.remCalc(24)
      }
    };
    if (!this.state.open) {
      return <div />;
    }
    return (
      <div style={styles.container}>
        <a style={styles.content} href="https://js.coach">
          <span>We've moved! &nbsp;Check out </span>
          <span className="u-hideSmall">our new catalog: </span>
          <span style={styles.link}>JS.coach</span>
        </a>
        <button style={styles.close} href="#" onClick={this.handleClick}>
          <Icon icon="close" />
        </button>
      </div>
    );
  },
  handleClick(e) {
    e.preventDefault();
    this.setState({ open: false });
  }
});

export default DeprecationNotice;
