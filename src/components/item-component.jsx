/*jshint esnext:true, browserify:true, unused:true, devel:true */
'use strict';

import React from 'react/addons';
import StylingMixin from '../helpers/styling-mixin.jsx';
import InteractionStylingMixin from '../helpers/interaction-mixin.jsx';
import Icon from './icon-component.jsx';
import TimeAgo from './timeago-component.jsx';
import ToggleButton from './toggle-button-component.jsx';

let PureRenderMixin = React.addons.PureRenderMixin;

let Header = React.createClass({
  mixins: [StylingMixin, PureRenderMixin],
  propTypes: {
    name: React.PropTypes.string.isRequired,
    githubUser: React.PropTypes.string.isRequired,
    latestVersion: React.PropTypes.string.isRequired,
    modified: React.PropTypes.string.isRequired
  },
  render() {
    let styles = {
      container: {
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
        paddingLeft: this.remCalc(3)
      },
      visited: {
        WebkitFontSmoothing: "antialiased",
        paddingLeft: this.remCalc(2),
        fontStyle: "italic"
      }
    };

    return (
      <h3 style={styles.container}>
        <span style={styles.name} dangerouslySetInnerHTML={{__html: this.props.name}}></span>

        <span style={styles.author}>
          <span> v{this.props.latestVersion} </span>
          <TimeAgo dateTime={this.props.modified} />
          <span> by </span>
          <span dangerouslySetInnerHTML={{__html: this.props.githubUser}}></span>
        </span>

        <span style={styles.visited}> visited</span>
      </h3>
    );
  }
});

let Stats = React.createClass({
  mixins: [StylingMixin, PureRenderMixin],
  propTypes: {
    stars: React.PropTypes.number.isRequired,
    downloads: React.PropTypes.number.isRequired
  },
  render() {
    let styles = {
      container: {
        marginTop: this.remCalc(2),
        marginBottom: this.remCalc(-5)
      },
      stats: {
        color: "#aaa",
        fontSize: this.remCalc(14),
        textAlign: "right",
        marginBottom: this.remCalc(6),
        paddingLeft: this.remCalc(16)
      },
      icon: {
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
      }
    };

    return (
      <div style={styles.container}>
        <div style={styles.stats}>
          <span style={ this.props.stars > 100 ? styles.topStars : {} }>
            <span>{this.props.stars}</span>
            <Icon icon="stars" style={styles.icon} />
          </span>
        </div>
        <div style={styles.stats}>
          <span style={ this.props.downloads > 2500 ? styles.topDownloads : {} }>
            <span>{this.props.downloads}</span>
            <Icon icon="cloud-download" style={styles.icon} />
          </span>
        </div>
      </div>
    );
  }
});

let Platforms = React.createClass({
  mixins: [StylingMixin, PureRenderMixin],
  propTypes: {
    android: React.PropTypes.bool,
    ios: React.PropTypes.bool
  },
  render() {
    let styles = {
      container: {
        WebkitFontSmoothing: "antialiased",
        alignItems: "center",
        boxSizing: "border-box",
        color: "#aaa",
        display: "flex",
        fontSize: this.remCalc(15),
        letterSpacing: this.remCalc(-0.4),
        marginTop: this.remCalc(5)
      },
      content: {
        WebkitBoxFlex: 1,
        flex: 1
      },
      platform: {
        paddingRight: this.remCalc(20)
      },
      icon: {
        fontSize: this.remCalc(16),
        marginLeft: this.remCalc(-2),
        marginRight: this.remCalc(4)
      }
    };

    return (
      <div className="u-displayFlex" style={styles.container}>
        <span style={styles.content}>
          { this.props.ios &&
            <span style={styles.platform}>
              <Icon icon="ios" style={styles.icon} /> For iOS
            </span> }

          { this.props.android &&
            <span style={styles.platform}>
              <Icon icon="android" style={styles.icon} /> For Android
            </span> }
        </span>
      </div>
    );
  }
});

let ComponentItem = React.createClass({
  mixins: [StylingMixin, InteractionStylingMixin, PureRenderMixin],
  propTypes: {
    description: React.PropTypes.string,
    githubUser: React.PropTypes.string.isRequired,
    githubName: React.PropTypes.string,
    latestVersion: React.PropTypes.string.isRequired,
    modified: React.PropTypes.string.isRequired,
    name: React.PropTypes.string.isRequired,
    stars: React.PropTypes.number.isRequired,
    downloads: React.PropTypes.number.isRequired,
    platforms: React.PropTypes.object
  },
  render() {
    let styles = {
      container: {
        background: "#fff",
        margin: 1
      },
      content: {
        MozUserSelect: "none",
        WebkitUserSelect: "none",
        alignItems: "center",
        boxSizing: "border-box",
        display: "flex",
        textDecoration: "none",
        padding: this.remCalc(12, 16, 14)
      },
      main: {
        WebkitBoxFlex: 1,
        flex: 1,
      },
      body: {
        boxSizing: "border-box",
        color: "#000",
        fontSize: this.remCalc(15.5),
        lineHeight: 1.3
      }
    };

    let homepage = `https://github.com/${ this.props.githubUser }/${ this.props.githubName || this.props.name }`;
    let highlightedName = this.props.nameHighlight || this.props.name;
    let highlightedGitHubUser = this.props.githubUserHighlight || this.props.githubUser;
    let highlightedDescription = this.props.descriptionHighlight || this.props.description;

    return (
      <div style={styles.container} {...this.trackInteractionStateHover()}>
        <a className="u-displayFlex u-visited" style={styles.content} href={homepage}>

          <div style={styles.main}>
            <Header
              name={ highlightedName }
              githubUser={ highlightedGitHubUser }
              latestVersion={ this.props.latestVersion }
              modified={ this.props.modified }
            />
            <div
              style={styles.body}
              dangerouslySetInnerHTML={{__html: highlightedDescription}}
            />
            { this.props.platforms && <Platforms {...this.props.platforms} /> }
          </div>

          <Stats stars={this.props.stars} downloads={this.props.downloads} />

          <ToggleButton name="component" detail={this.props.name}
            hideUntoggled={!this.interactionStateIsHover()} />
        </a>
      </div>
    );
  }
});

export default ComponentItem;
