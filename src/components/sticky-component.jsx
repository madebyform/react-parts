/*jshint esnext:true, browserify:true, unused:true, devel:true */
'use strict';

import React from 'react/addons';
import StylingMixin from '../helpers/styling-mixin.jsx';

let PureRenderMixin = React.addons.PureRenderMixin;

let Sticky = React.createClass({
  mixins: [StylingMixin, PureRenderMixin],
  propTypes: {
    style: React.PropTypes.object.isRequired, // `float` and `width` are required
    disable: React.PropTypes.bool, // If it shouldn't stick at all
    fixOnUpdate: React.PropTypes.bool, // If it should fix on top on updates
    offsetTop: React.PropTypes.number.isRequired, // When the fixed position should start
    top: React.PropTypes.number.isRequired // `top` value to be used with `position:fixed`
  },
  getDefaultProps() {
    return {
      disable: false
    };
  },
  getInitialState() {
    return {
      fixed: false
    };
  },
  render() {
    return (
      <div>
        <div data-shadow />
        <div style={this.props.style}>
          {this.props.children}
        </div>
      </div>
    );
  },
  componentDidMount() {
    this.panel = this.getDOMNode().childNodes[1];

    // The shadow panel is an invisible element that always has the same height as the panel
    // When the panel is fixed, the shadow panel will have its width to handle `resize`
    this.shadowPanel = this.getDOMNode().childNodes[0];

    window.addEventListener("scroll", this.updateStickyPosition, false);
    window.addEventListener("resize", this.updateStickyPosition, false);
  },
  componentWillUnmount() {
    window.removeEventListener("scroll", this.updateStickyPosition);
    window.removeEventListener("resize", this.updateStickyPosition);
  },
  componentDidUpdate(prevProps) {
    if (this.props.children != prevProps.children) {
      this.updateStickyPosition(this.props.fixOnUpdate);
    }
  },
  updateStickyPosition(forceTop = false) {
    if (this.props.disable) return;

    // If we are overscrolling (Safari), do nothing
    if (window.scrollY + window.innerHeight > document.body.scrollHeight) return;

    let panel = this.panel;
    let shadowPanel = this.shadowPanel;

    // If the panel is fixed, we need to set it's left and right coordinate to match
    // the original position. The shadow has always `position:static` and should at this
    // moment have the appropriate `width`. So we can use that. This will take care of
    // updating the horizontal position when the browser is horizontally resized too.
    if (this.state.fixed) {
      let offsetFromLeft = shadowPanel.getBoundingClientRect().left;
      let offsetFromRight = window.innerWidth - shadowPanel.getBoundingClientRect().right;

      panel.style.left  = `${ offsetFromLeft }px`;
      panel.style.right = `${ offsetFromRight }px`;
    }

    // Make sure the shadow panel is floating and we use the current height of our panel
    shadowPanel.style.float = this.props.style.float;
    let height = Math.max(panel.offsetHeight, panel.childNodes[0].offsetHeight);
    shadowPanel.style.height = `${ height }px`;

    let topRelativePos = shadowPanel.getBoundingClientRect().top;
    let bottomRelativePos = shadowPanel.getBoundingClientRect().bottom;
    let smallerThanScreen = shadowPanel.offsetHeight < window.innerHeight;

    // If the panel's top is below screen's top or is smaller than the screen:
    if (topRelativePos >= this.props.top || smallerThanScreen || forceTop === true) {
      // console.log(`${ this.props.id }: Looking at the top`);
      let scrolledPastDefaultOffset = window.scrollY > this.props.offsetTop;

      // If we scrolled beyond the top offset, the panel should be fixed on top
      if (scrolledPastDefaultOffset) {
        // console.log(`${ this.props.id }: Fix to top`);
        let diff = window.scrollY - this.props.offsetTop + this.props.top;
        shadowPanel.style.marginTop = `${ diff }px`;
        panel.style.top = `${ this.props.top }px`;
        this.fixPanel(panel, shadowPanel);
      }
      // If we have not scrolled beyond the top offset, make sure the panel is unfixed
      // and that the original position is fully restored
      else {
        // console.log(`${ this.props.id }: Unfixing due to top`);
        shadowPanel.style.marginTop = "0";
        this.unfixPanel(panel, shadowPanel);
      }

    // If the panel's bottom is above screen's bottom and is not smaller than screen:
    } else if (bottomRelativePos < window.innerHeight && !smallerThanScreen) {
      // console.log(`${ this.props.id }: Looking at the bottom`);

      if (bottomRelativePos < window.innerHeight) {
        // console.log(`${ this.props.id }: Fix to bottom`);
        let diff = window.innerHeight - bottomRelativePos;
        shadowPanel.style.marginTop = `${ diff }px`;
        panel.style.bottom = "0";
        this.fixPanel(panel, shadowPanel);
      } else {
        // console.log(`${ this.props.id }: Unfixing due to bottom`);
        shadowPanel.style.marginTop = "0";
        this.unfixPanel(panel, shadowPanel);
      }

    } else {
      // console.log(`${ this.props.id }: Unfixing`);
      this.unfixPanel(panel, shadowPanel);
    }
  },
  unfixPanel(panel, shadowPanel) {
    panel.style.top = null;
    panel.style.bottom = null;
    panel.style.position = null;
    panel.style.width = this.props.style.width;
    panel.style.marginTop = shadowPanel.style.marginTop;

    shadowPanel.style.width = null;
    shadowPanel.style.marginLeft = "-99px";

    this.setState({ fixed: false });
  },
  fixPanel(panel, shadowPanel) {
    panel.style.marginTop = "0";
    panel.style.width = null;
    panel.style.position = "fixed";

    shadowPanel.style.width = this.props.style.width;
    shadowPanel.style.marginLeft = null;

    this.setState({ fixed: true });
  }
});

export default Sticky;
