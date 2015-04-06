/*jshint esnext:true, browserify:true, unused:true */
'use strict';

import React from 'react/addons';

/*
 * Scroller Component
 *
 * Component that can be used to manipulate scroll position (based on goo.gl/9BkKDQ).
 * Available modes (set it with the `position` property):
 * - Same:        The user will be given the impression his scroll position
 *                didn't change, even if content was added above the fold;
 * - Top:         Scroll to the top;
 * - Bottom:      Scroll to the bottom;
 * - Stay bottom: The scroll position remains the same, which can be unexpected
 *                for the user, if new content was added above the fold.
 */
let Scroller = React.createClass({
  propTypes: {
    // A simple id that can be used for CSS
    id: React.PropTypes.string,
    // The position to where to scroll
    position: React.PropTypes.oneOf(
      ['same', 'top', 'bottom', 'stay-bottom']
    ).isRequired,
  },
  getDefaultProps() {
    return {
      position: "same"
    };
  },
  componentDidMount() {
    let node = this.getDOMNode();
    node.addEventListener("mousewheel", this._onScroll);
  },
  componentWillUnmount() {
    let node = this.getDOMNode();
    node.removeListener("mousewheel", this._onScroll);
  },
  componentWillUpdate() {
    let node = this.getDOMNode();

    // Store the current scroll position
    this.scrollHeight = node.scrollHeight;
    this.scrollTop = node.scrollTop;
    this.isAtBottom = node.scrollTop + node.offsetHeight === node.scrollHeight;
  },
  componentDidUpdate() {
    let node = this.getDOMNode();

    switch (this.props.position) {
      // The user will be given the impression his scroll position didn't
      // change, even if content was added above the fold
      case "same":
        // Scroll to the added delta
        node.scrollTop = this.scrollTop + (node.scrollHeight - this.scrollHeight);
        break;
      // Scroll to the top
      case "top":
        node.scrollTop = 0;
        break;
      // Scroll to the bottom
      case "bottom":
        node.scrollTop = node.scrollHeight;
        break;
      // Scroll to the bottom if user is already at the bottom
      case "stay-bottom":
        if (this.isAtBottom) node.scrollTop = node.scrollHeight;
        break;
      // The scroll position remains the same, which can be unexpected for
      // the user, if new content was added above the fold.
      default:
    }
  },
  render() {
    return (
      <div {...this.props} />
    );
  }
});

export default Scroller;
