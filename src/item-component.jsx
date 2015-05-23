/*jshint esnext:true, browserify:true, unused:true, devel:true */
'use strict';

import React from 'react/addons';
import StylingMixin from './styling-mixin.jsx';
import Icon from './icon-component.jsx';
import TimeAgo from './timeago-component.jsx';

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
    stars: React.PropTypes.number.isRequired,
    debugMode: React.PropTypes.bool
  },
  getDefaultProps() {
    return {
      debugMode: false
    };
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
        WebkitBoxFlex: 1,
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

    if (this.props.debugMode) {
      ['description', 'modified', 'stars'].forEach((prop) => {
        if (typeof this.props[prop] == "undefined")
          console.log(`Undefined ${ prop } for ${ this.props.repo }`);
      });
    }
    return (
      <div className="ComponentItem" style={styles.container}>
        <div className="ComponentItem-header" style={styles.header}>
          <h3 style={styles.title}>
            <a style={styles.name} href={this.props.homepage}>
              {this.props.name}
            </a>
            <small>
              <span style={styles.author}>by {this.props.githubUser}</span>
              <TimeAgo dateTime={this.props.modified} />
            </small>
          </h3>
          <div style={styles.stats}>
            <Icon icon="cloud-download" />
            <span>{this.props.downloads}</span>
          </div>
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
