/*jshint esnext:true, browserify:true, unused:true */
'use strict';

import timeago from 'timeago';
import React from 'react/addons';
import StylingMixin from './styling-mixin.jsx';
import Icon from './icon-component.jsx';

let PureRenderMixin = React.addons.PureRenderMixin;

let ComponentItem = React.createClass({
  mixins: [StylingMixin, PureRenderMixin],
  propTypes: {
    description: React.PropTypes.string,
    githubUser: React.PropTypes.string.isRequired,
    homepage: React.PropTypes.string.isRequired,
    latestVersion: React.PropTypes.string.isRequired,
    modified: React.PropTypes.string.isRequired,
    name: React.PropTypes.string.isRequired,
    stars: React.PropTypes.number.isRequired
  },
  render() {
    let styles = {
      container: {
        background: "#fff",
        boxShadow: "0 1px 2px rgba(0,0,0,.2)",
        margin: 1,
        padding: this.remCalc(15, 20)
      },
      header: {
        alignItems: "center",
        boxSizing: "border-box",
        display: "flex",
        marginBottom: this.remCalc(10)
      },
      title: {
        flex: 1,
        margin: 0
      },
      name: {
        color: "#3949ab",
        textDecoration: "none"
      },
      author: {
        paddingLeft: this.remCalc(8)
      },
      timestamp: {
        color: "#999",
        fontWeight: 200,
        paddingLeft: this.remCalc(8)
      },
      stats: {
        paddingLeft: this.remCalc(12)
      },
      description: {
        margin: 0
      }
    };
    return (
      <div style={styles.container}>
        <div style={styles.header}>
          <h3 style={styles.title}>
            <a style={styles.name} href={this.props.homepage}>
              {this.props.name}
            </a>
            <small>
              <span style={styles.author}>by {this.props.githubUser}</span>
              <time dateTime={this.props.modified} style={styles.timestamp}>
                {timeago(this.props.modified)}
              </time>
            </small>
          </h3>
          <div style={styles.stats}>
            <Icon icon="stars" />
            <span>{this.props.stars}</span>
          </div>
          <div style={styles.stats}>
            <Icon icon="versions" />
            <span>v{this.props.latestVersion}</span>
          </div>
        </div>
        <p style={styles.description}>
          {this.props.description}
        </p>
      </div>
    );
  }
});

export default ComponentItem;
