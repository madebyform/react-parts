/*jshint esnext:true, browserify:true, unused:true */
'use strict';

import React from 'react/addons';
import StylingMixin from '../helpers/styling-mixin.jsx';
import Icon from './icon-component.jsx';

let PureRenderMixin = React.addons.PureRenderMixin;

let Twitter = React.createClass({
  mixins: [StylingMixin, PureRenderMixin],
  render() {
    let styles = {
      bottom: this.remCalc(38),
      color: "#aaa",
      fontSize: this.remCalc(32),
      position: "fixed",
      right: this.remCalc(42),
      textDecoration: "none"
    };
    return (
      <a className="u-hideMedium" style={styles} href="https://twitter.com/reactparts">
        <Icon icon="twitter" />
      </a>
    );
  }
});

export default Twitter;
