/*jshint esnext:true, browserify:true, unused:true, devel:true */
'use strict';

import React from 'react/addons';
import StylingMixin from '../helpers/styling-mixin.jsx';
import Icon from './icon-component.jsx';

let PureRenderMixin = React.addons.PureRenderMixin;

/*
 * A simple toggle button. Only one toggle is on at each time.
 * An event gets triggered to turn off other toggle buttons.
 */
let ToggleButton = React.createClass({
  mixins: [StylingMixin, PureRenderMixin],
  propTypes: {
    name: React.PropTypes.string.isRequired,
    detail: React.PropTypes.string.isRequired,
    hideUntoggled: React.PropTypes.bool,
    toggleIcon: React.PropTypes.string,
    untoggleIcon: React.PropTypes.string
  },
  getDefaultProps() {
    return {
      hideUntoggled: false,
      toggleIcon: "expand",
      untoggleIcon: "close"
    };
  },
  getInitialState() {
    return {
      toggled: false
    };
  },
  render() {
    let styles = {
      container: {
        background: "#4b67a5",
        borderRadius: this.remCalc(20),
        boxShadow: "0 1px 3px rgba(0,0,0,.25)",
        color: "#f7f8fa",
        height: this.remCalc(24),
        marginLeft: this.remCalc(4),
        marginRight: this.remCalc(-32),
        padding: this.remCalc(2),
        width: this.remCalc(24),
        zIndex: 100
      },
      untoggle: {
        background: "#253b6b"
      },
      icon: {
        fontSize: this.remCalc(27)
      }
    };

    if (!this.state.toggled && !this.props.hideUntoggled) {
      return (
        <div style={styles.container} onClick={this.handleToggle} className="u-hideMedium">
          <Icon icon={this.props.toggleIcon} style={styles.icon} />
        </div>
      );
    } else if (this.state.toggled) {
      return (
        <div style={this.mergeStyles(styles.container, styles.untoggle)} onClick={this.handleUntoggle}>
          <Icon icon={this.props.untoggleIcon} style={styles.icon} />
        </div>
      );
    } else {
      return <div />;
    }
  },
  handleToggle(e) {
    e.preventDefault();

    let eventName = `toggle-${ this.props.name }`;
    let event = new CustomEvent(eventName, { detail: this.props.detail });
    document.dispatchEvent(event);

    this.setState({ toggled: true });
  },
  handleUntoggle(e) {
    e.preventDefault();

    let eventName = `untoggle-${ this.props.name }`;
    let event = new CustomEvent(eventName);
    document.dispatchEvent(event);

    this.setState({ toggled: false });
  },
  componentDidMount() {
    let eventName = `toggle-${ this.props.name }`;
    document.addEventListener(eventName, this.handleExternalToggle, false);
  },
  componentWillUnmount() {
    let eventName = `toggle-${ this.props.name }`;
    document.removeEventListener(eventName, this.handleExternalToggle);
  },
  handleExternalToggle(e) {
    let detail = e.detail;
    if (this.props.detail != detail) {
      this.setState({ toggled: false });
    }
  }
});

export default ToggleButton;
