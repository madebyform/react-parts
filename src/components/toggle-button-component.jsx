/*jshint esnext:true, browserify:true, unused:true, devel:true */
'use strict';

import React from 'react/addons';
import StylingMixin from '../helpers/styling-mixin.jsx';
import Icon from './icon-component.jsx';

let PureRenderMixin = React.addons.PureRenderMixin;

/*
 * A simple toggle button. Events get triggered on toggle and untoggle.
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
      toggleIcon: "more",
      untoggleIcon: "close",
      toggled: false
    };
  },
  render() {
    let styles = {
      container: {
        background: "#fff",
        borderRadius: this.remCalc(40),
        boxShadow: "0 1px 3px rgba(0,0,0,.25)",
        boxSizing: "border-box",
        color: "#4b67a5",
        height: this.remCalc(28),
        marginLeft: this.remCalc(4),
        marginRight: this.remCalc(-32),
        padding: this.remCalc(2, 1),
        textAlign: "center",
        width: this.remCalc(28)
      },
      untoggle: {
      },
      icon: {
        fontSize: this.remCalc(27),
        verticalAlign: "middle"
      }
    };

    if (!this.props.toggled && !this.props.hideUntoggled) {
      return (
        <div style={styles.container} onClick={this.props.handleToggle} className="u-hideSmall">
          <Icon icon={this.props.toggleIcon} style={styles.icon} />
        </div>
      );
    } else if (this.props.toggled) {
      return (
        <div style={this.mergeStyles(styles.container, styles.untoggle)} onClick={this.props.handleUntoggle}>
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
  },
  handleUntoggle(e) {
    e.preventDefault();

    let eventName = `untoggle-${ this.props.name }`;
    let event = new CustomEvent(eventName);
    document.dispatchEvent(event);
  }
});

export default ToggleButton;
