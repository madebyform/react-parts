/*jshint esnext:true, browserify:true, unused:true */
'use strict';

import timeago from 'timeago';
import React from 'react/addons';
import StylingMixin from '../helpers/styling-mixin.jsx';

let PureRenderMixin = React.addons.PureRenderMixin;

// Remove the "about" word from timestamps to make them shorter
Object.assign(timeago.settings.strings, {
  seconds: "a minute",
  minute: "a minute",
  minutes: "%d minutes",
  hour: "an hour",
  hours: "%d hours",
  day: "a day",
  days: "%d days",
  month: "a month",
  months: "%d months",
  year: "a year",
  years: "%d years",
});

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
        { relativeTimestamp && `published ${ relativeTimestamp }` }
      </time>
    );
  }
});

export default TimeAgo;
