/*jshint esnext:true, browserify:true, unused:true */
'use strict';

import React from 'react/addons';
import StylingMixin from './styling-mixin.jsx';

let PureRenderMixin = React.addons.PureRenderMixin;

let Footer = React.createClass({
  mixins: [StylingMixin, PureRenderMixin],
  render() {
    let styles = {
      footer: {
        fontSize: this.remCalc(15),
        marginBottom: this.remCalc(30),
        marginTop: this.remCalc(40),
        position: "relative"
      },
      content: {
        marginLeft: this.remCalc(62)
      },
      label: {
        paddingRight: this.remCalc(20)
      },
      link: {
        color: "#253b6b",
        fontWeight: 600,
        paddingRight: this.remCalc(20),
        textDecoration: "none"
      },
      logo: {
        height: this.remCalc(44),
        left: 0,
        marginBottom: this.remCalc(16),
        marginRight: this.remCalc(16),
        position: "absolute",
        width: this.remCalc(44)
      },
      copy: {
        color: "#999",
        fontWeight: 200
      }
    };
    return (
      <div style={styles.footer}>
        <a href="http://madebyform.com">
          <img style={styles.logo} src="/madebyform-logo.svg" alt="Made by Form" draggable="false" />
        </a>

        <div style={styles.content}>
          <span style={styles.label}>More Resources</span>

          <a style={styles.link} href="https://github.com/facebook/react/wiki/">
            <span className="u-hideSmall">React</span> Wiki
          </a>
          <a style={styles.link} href="https://discuss.reactjs.org/">
            <span className="u-hideSmall">React</span> Discuss
          </a>
          <a style={styles.link} href="http://reactiflux.com/">
            <span className="u-hideSmall">Reactiflux</span> Slack
          </a>
          <a style={styles.link} href="https://github.com/enaqx/awesome-react/">
            Awesome React
          </a>
          <a style={styles.link} href="https://rnplay.org/">
            RNPlay
          </a>

          <div style={styles.copy}>
            React, React Native and logos are copyright of Facebook.
            This page is not affiliated with Facebook.
          </div>
        </div>
      </div>
    );
  }
});

export default Footer;
