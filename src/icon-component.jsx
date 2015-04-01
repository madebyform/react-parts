/*jshint esnext:true, browserify:true, unused:true */
'use strict';

import React from 'react/addons';
import StylingMixin from './styling-mixin.jsx';

let PureRenderMixin = React.addons.PureRenderMixin;

/*
 * Subset of the SVG icon collection from GitHub
 */
let Icon = React.createClass({
  mixins: [StylingMixin, PureRenderMixin],
  propTypes: {
    icon: React.PropTypes.string.isRequired,
    size: React.PropTypes.oneOfType([
      React.PropTypes.string,
      React.PropTypes.number
    ]),
    style: React.PropTypes.object
  },
  getDefaultProps() {
    return {
      size: "1em"
    };
  },
  renderGraphic() {
    switch (this.props.icon) {
      case 'stars':
        return (
          <g><path d="M896 384l-313.5-40.781L448 64 313.469 343.219 0 384l230.469
            208.875L171 895.938l277-148.812 277.062 148.812L665.5 592.875 896 384z"/></g>
        );
      case 'versions':
        return (
          <g><path d="M0 704h128v-64H64V384h64v-64H0V704zM384 192v640h512V192H384zM768
            704H512V320h256V704zM192 768h128v-64h-64V320h64v-64H192V768z"/></g>
        );
    }
  },
  render() {
    let styles = {
      fill: "currentcolor",
      margin: "0 .1em",
      verticalAlign: "-0.05em",
      width: this.props.size // CSS instead of the width attr to support non-pixel units
    };
    return (
      <svg viewBox="0 0 1024 896" preserveAspectRatio="xMidYMid meet" fit
        style={this.mergeStyles(
          styles,
          this.props.style // This lets the parent pass custom styles
        )}>
          {this.renderGraphic()}
      </svg>
    );
  }
});

export default Icon;
