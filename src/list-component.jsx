/*jshint esnext:true, browserify:true, unused:true */
'use strict';

import React from 'react/addons';
import StylingMixin from './styling-mixin.jsx';
import ComponentItem from './item-component.jsx';

let PureRenderMixin = React.addons.PureRenderMixin;

let NoComponents = React.createClass({
  mixins: [StylingMixin, PureRenderMixin],
  render() {
    let styles = {
      container: {
        background: "#fff",
        boxShadow: "0 1px 2px rgba(0,0,0,.2)",
        margin: 1,
        padding: this.remCalc(15, 20),
        color: "#999",
      },
      message: {
        width: "100%",
        textAlign: "center",
      }
    };
    return (
      <div style={styles.container}>
        <p style={styles.message}>No components found.</p>
      </div>
    );
  }
});

let ComponentList = React.createClass({
  mixins: [StylingMixin, PureRenderMixin],
  propTypes: {
    components: React.PropTypes.array.isRequired
  },
  render() {
    let styles = {
      listStyle: "none",
      margin: 0,
      padding: 0
    };
    let components = this.props.components.map(function(item, index) {
      return (
        <li key={index}>
          <ComponentItem {...item} />
        </li>
      );
    });

    if (components.length === 0) {
      return (
        <NoComponents />
      );
    }

    return (
      <ul style={styles}>
        {components}
      </ul>
    );
  }
});

export default ComponentList;
