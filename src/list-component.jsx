/*jshint esnext:true, browserify:true, unused:true */
'use strict';

import React from 'react/addons';
import StylingMixin from './styling-mixin.jsx';
import ComponentItem from './item-component.jsx';

let PureRenderMixin = React.addons.PureRenderMixin;

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
    return (
      <ul style={styles}>
        {components}
      </ul>
    );
  }
});

export default ComponentList;
