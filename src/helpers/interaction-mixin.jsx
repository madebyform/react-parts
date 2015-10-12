/*jshint esnext:true, browserify:true, unused:vars */
'use strict';

/*
 * Interaction State Styling Mixin
 *
 * Simple mixin with utility methods for implementing CSS :active, :hover and
 * :focus pseudo-classes. Currently only supports :hover.
 */
let InteractionStylingMixin = {
  getInitialState() {
    return {
      _interactionStateHover: false
    };
  },
  // Sets up listeners for mouse down and up events. Usage example:
  //    <button {...this.trackInteractionStateHover()}
  //      style={this.mergeStyles(
  //        this.interactionStateIsHover() && styles.hover
  //    )}> My Button </button>
  trackInteractionStateHover() {
    return {
      onMouseEnter: this._onMouseEnter,
      onMouseLeave: this._onMouseLeave
    };
  },
  // Checks if the interaction state is currently active (the mouse is down).
  // @return {Boolean}
  interactionStateIsHover() {
    return this.state._interactionStateHover === true;
  },
  _onMouseEnter(e) {
    this.setState({ _interactionStateHover: true });
  },
  _onMouseLeave(e) {
    this.setState({ _interactionStateHover: false });
  }
};

export default InteractionStylingMixin;
