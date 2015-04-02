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
  },
  getInitialState() {
    return {
      timeAgo: null
    };
  },
  componentWillMount() {
    this.setState({
      timeAgo: this.props.dateTime,
    });
  },
  componentDidMount() {
    this.setState({
      timeAgo: timeago(this.props.dateTime),
    });
  },
  render() {
    let styles = {
      timestamp: {
        color: "#999",
        fontWeight: 200,
        paddingLeft: this.remCalc(8)
      },
    };
    return (
      <time dateTime={this.props.dateTime} style={styles.timestamp}>
        updated {this.state.timeAgo}
      </time>
    );
  }
});

export default TimeAgo;
