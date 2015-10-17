/*jshint esnext:true, browserify:true, unused:true */
'use strict';

import React from 'react/addons';
import StylingMixin from '../helpers/styling-mixin.jsx';

let PureRenderMixin = React.addons.PureRenderMixin;

let Footer = React.createClass({
  mixins: [StylingMixin, PureRenderMixin],
  render() {
    let styles = {
      footer: {
        MozUserSelect: "none",
        WebkitUserSelect: "none",
        fontSize: this.remCalc(15),
        marginBottom: this.remCalc(15),
        marginTop: this.remCalc(40),
        position: "relative",
        textAlign: "center"
      },
      link: {
        color: "#253b6b",
        fontWeight: 600,
        paddingLeft: this.remCalc(14),
        textDecoration: "none"
      },
      copy: {
        color: "#999",
        fontWeight: 300,
        marginTop: this.remCalc(2)
      },
      copyLink: {
        borderBottom: "1px solid #c4c5c7",
        color: "inherit",
        fontWeight: 400,
        textDecoration: "none"
      },
      sponsors: {
        marginLeft: "auto",
        marginRight: "auto",
        marginTop: this.remCalc(16),
        width: "100%"
      },
      logo: {
        height: this.remCalc(30),
        padding: this.remCalc(17)
      }
    };
    return (
      <div style={styles.footer}>
        <div>
          <span>More Resources</span>

          <a style={styles.link} href="https://discuss.reactjs.org/">
            Discussions
          </a>
          <a style={styles.link} href="http://reactiflux.com/">
            Slack
          </a>
          <a style={styles.link} href="https://github.com/facebook/react/wiki/">
            React Wiki
          </a>
          <a style={styles.link} href="https://github.com/ericvicenti/react-native-community/">
            React Native Community
          </a>
          <a style={styles.link} href="https://github.com/enaqx/awesome-react/">
            Awesome React
          </a>
          <a style={styles.link} href="https://rnplay.org/">
            RNPlay
          </a>

          <div style={styles.copy}>
            This page is not affiliated with Facebook.
            Proudly hosted by <a style={styles.copyLink} href="https://digitalocean.com/?utm_source=react.parts">DigitalOcean</a>.
            Search powered by <a style={styles.copyLink} href="https://algolia.com/?utm_source=react.parts">Algolia</a>.
          </div>
        </div>

        <div style={styles.sponsors}>
          <a href="http://madebyform.com">
            <img style={styles.logo} src="/madebyform-logo.svg" alt="Made by Form" draggable="false" />
          </a>
          <a href="https://digitalocean.com/?utm_source=react.parts">
            <img style={styles.logo} src="/digitalocean-logo.svg" alt="Digital Ocean" draggable="false" />
          </a>
          <a href="https://algolia.com/?utm_source=react.parts">
            <img style={styles.logo} src="/algolia-logo.svg" alt="Algolia" draggable="false" />
          </a>
        </div>
      </div>
    );
  }
});

export default Footer;
