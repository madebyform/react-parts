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
      size: "0.9em"
    };
  },
  renderGraphic() {
    switch (this.props.icon) {
      case 'cloud-download':
        return (
          <g><path d="m19.35 10.04c-.68-3.45-3.71-6.04-7.35-6.04-2.89 0-5.4 1.64-6.65
            4.04-3.01.32-5.35 2.87-5.35 5.96 0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5
            0-2.64-2.05-4.78-4.65-4.96m-2.35 2.96l-5 5-5-5h3v-4h4v4h3"/></g>
        );
      case 'stars':
        return (
          <g><path d="m12 17.27l6.18 3.73-1.64-7.03 5.46-4.73-7.19-.61-2.81-6.63-2.81
            6.63-7.19.61 5.46 4.73-1.64 7.03 6.18-3.73"/></g>
        );
      case 'android':
        return (
          <g><path d="m5 18c0 .55.45 1 1 1h1v3.5c0 .83.67 1.5 1.5 1.5.83 0 1.5-.67
            1.5-1.5v-3.5h2v3.5c0 .83.67 1.5 1.5 1.5.83 0 1.5-.67 1.5-1.5v-3.5h1c.55 0
            1-.45 1-1v-10h-12v10m-2.5-10c-.83 0-1.5.67-1.5 1.5v7c0 .83.67 1.5 1.5 1.5.83
            0 1.5-.67 1.5-1.5v-7c0-.83-.67-1.5-1.5-1.5m17 0c-.83 0-1.5.67-1.5 1.5v7c0
            .83.67 1.5 1.5 1.5.83 0 1.5-.67
            1.5-1.5v-7c0-.83-.67-1.5-1.5-1.5m-4.97-5.84l1.3-1.3c.2-.2.2-.51
            0-.71-.2-.2-.51-.2-.71 0l-1.48 1.48c-.79-.4-1.69-.63-2.64-.63-.96
            0-1.86.23-2.66.63l-1.49-1.48c-.2-.2-.51-.2-.71 0-.2.2-.2.51 0 .71l1.31
            1.31c-1.48 1.09-2.45 2.84-2.45 4.83h12c0-1.99-.97-3.75-2.47-4.84m-5.53
            2.84h-1v-1h1v1m5 0h-1v-1h1v1"/></g>
        );
      case 'ios':
        return (
          <g><path d="m15.51 0c-.988.04-2.185.67-2.894 1.516-.635.748-1.192 1.945-1.041
            3.094 1.102.087 2.228-.571 2.914-1.415.686-.846 1.149-2.022 1.022-3.194m-.376
            4.82c-1.396.019-2.69.932-3.404.932-.775
            0-1.974-.893-3.242-.868-1.669.025-3.206.987-4.065 2.507-1.733 3.059-.442 7.593
            1.245 10.08.826 1.214 1.809 2.581 3.102 2.531 1.246-.05 1.716-.819 3.219-.819
            1.503 0 1.927.819 3.243.795 1.339-.026 2.189-1.241 3.01-2.458.946-1.409
            1.337-2.773 1.36-2.845-.03-.013-2.611-1.02-2.638-4.046-.022-2.531 2.031-3.746
            2.124-3.806-1.155-1.721-2.953-1.957-3.595-1.984-.119-.012-.239-.017-.357-.016"/></g>
        );
    }
  },
  render() {
    let styles = {
      fill: "currentcolor",
      verticalAlign: "-0.1em",
      width: this.props.size, // CSS instead of the width attr to support non-pixel units
      height: this.props.size
    };
    return (
      <svg viewBox="0 0 24 24" preserveAspectRatio="xMidYMid meet" fit
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
