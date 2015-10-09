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
    githubName: React.PropTypes.string,
    latestVersion: React.PropTypes.string.isRequired,
    modified: React.PropTypes.string.isRequired,
    name: React.PropTypes.string.isRequired,
    stars: React.PropTypes.number.isRequired,
    platforms: React.PropTypes.object
  },
  render() {
    let styles = {
      container: {
        MozUserSelect: "none",
        WebkitUserSelect: "none",
        background: "#fff",
        display: "block",
        margin: 1,
        padding: this.remCalc(12, 16, 14),
        textDecoration: "none"
      },
      content: {
        alignItems: "center",
        boxSizing: "border-box",
        display: "flex",
      },
      main: {
        WebkitBoxFlex: 1,
        flex: 1,
      },
      sidebar: {
        marginTop: this.remCalc(2),
        marginBottom: this.remCalc(-5)
      },
      title: {
        fontSize: this.remCalc(16),
        fontWeight: 400,
        margin: 0,
        marginBottom: this.remCalc(4),
        overflow: "hidden",
        textOverflow: "ellipsis",
        whiteSpace: "nowrap"
      },
      name: {
        color: "#000",
        fontSize: this.remCalc(17),
        fontWeight: 600,
        textDecoration: "none"
      },
      author: {
        WebkitFontSmoothing: "antialiased",
        color: "#aaa",
        letterSpacing: this.remCalc(-0.4),
        paddingLeft: this.remCalc(6)
      },
      visited: {
        WebkitFontSmoothing: "antialiased",
        display: "inline-block",
        paddingLeft: this.remCalc(6),
        transform: "skewX(-9deg)"
      },
      stats: {
        color: "#aaa",
        fontSize: this.remCalc(14),
        textAlign: "right",
        marginBottom: this.remCalc(6),
        paddingLeft: this.remCalc(16)
      },
      statsIcon: {
        fontSize: this.remCalc(19),
        marginLeft: this.remCalc(8),
        marginRight: this.remCalc(-1),
        verticalAlign: "-0.2em",
      },
      topStars: {
        color: "#d3b656",
        fontWeight: 600
      },
      topDownloads: {
        color: "#757db1",
        fontWeight: 600
      },
      body: {
        boxSizing: "border-box",
        color: "#000",
        fontSize: this.remCalc(15.5),
        lineHeight: 1.3
      },
      footer: {
        WebkitFontSmoothing: "antialiased",
        alignItems: "center",
        boxSizing: "border-box",
        color: "#aaa",
        display: "flex",
        fontSize: this.remCalc(15),
        letterSpacing: this.remCalc(-0.4),
        marginTop: this.remCalc(5)
      },
      metadata: {
        WebkitBoxFlex: 1,
        flex: 1
      },
      platform: {
        paddingRight: this.remCalc(20)
      },
      platformIcon: {
        fontSize: this.remCalc(16),
        marginLeft: this.remCalc(-2),
        marginRight: this.remCalc(4)
      },
      timestamp: {
        WebkitBoxFlex: 1,
        flex: 1,
        textAlign: "right"
      }
    };

    return (
      <a className="u-visited" style={styles.container}
        href={`https://github.com/${ this.props.githubUser }/${ this.props.githubName || this.props.name }`}>
        <div className="u-displayFlex" style={styles.content}>
          <div style={styles.main}>
            <h3 style={styles.title}>
              <span style={styles.name}
                dangerouslySetInnerHTML={{__html: this.props.nameHighlight || this.props.name}}></span>
              <span style={styles.author}>
                v{this.props.latestVersion} <TimeAgo dateTime={this.props.modified} /> by <span
                  dangerouslySetInnerHTML={{__html: this.props.githubUserHighlight || this.props.githubUser}}></span>
              </span>
              <span style={styles.visited}>visited</span>
            </h3>
            <div style={styles.body}
              dangerouslySetInnerHTML={{__html: this.props.descriptionHighlight || this.props.description}}></div>

            { this.props.platforms &&
            <div className="u-displayFlex" style={styles.footer}>
              <span style={styles.metadata}>
                { this.props.platforms && this.props.platforms.ios &&
                <span style={styles.platform}>
                  <Icon icon="ios" style={styles.platformIcon} /> For iOS
                </span> }
                { this.props.platforms && this.props.platforms.android &&
                <span style={styles.platform}>
                  <Icon icon="android" style={styles.platformIcon} /> For Android
                </span> }
              </span>
            </div> }
          </div>

          <div style={styles.sidebar}>
            <div style={styles.stats}>
              <span style={ this.props.stars > 100 ? styles.topStars : {} }>
                <span>{this.props.stars}</span>
                <Icon icon="stars" style={styles.statsIcon} />
              </span>
            </div>
            <div style={styles.stats}>
              <span style={ this.props.downloads > 2500 ? styles.topDownloads : {} }>
                <span>{this.props.downloads}</span>
                <Icon icon="cloud-download" style={styles.statsIcon} />
              </span>
            </div>
          </div>
        </div>
      </a>
    );
  }
});

export default ComponentItem;
