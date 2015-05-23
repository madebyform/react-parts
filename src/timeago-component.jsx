/*jshint esnext:true, browserify:true, unused:true */
'use strict';

import timeago from 'timeago';
import React from 'react/addons';
import StylingMixin from './styling-mixin.jsx';

let PureRenderMixin = React.addons.PureRenderMixin;

let TimeAgo = React.createClass({
  mixins: [StylingMixin, PureRenderMixin],
  propTypes: {
    dateTime: React.PropTypes.string.isRequired,
    style: React.PropTypes.object
  },
  render() {
    let relativeTimestamp = timeago(this.props.dateTime);
    return (
      <time dateTime={this.props.dateTime} style={this.props.style}>
        { relativeTimestamp && `updated ${ relativeTimestamp }` }
      </time>
    );
  }
});

export default TimeAgo;
