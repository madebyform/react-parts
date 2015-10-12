/*jshint esnext:true, browserify:true, unused:true */
'use strict';

import 'isomorphic-fetch';
import React from 'react/addons';
import StylingMixin from '../helpers/styling-mixin.jsx';

let PureRenderMixin = React.addons.PureRenderMixin;

/*
 * Displays the documentation of a component
 */
let Readme = React.createClass({
  mixins: [StylingMixin, PureRenderMixin],
  propTypes: {
    componentName: React.PropTypes.string.isRequired
  },
  getInitialState() {
    return {
      content: ""
    };
  },
  render() {
    let styles = {
      container: {
        background: "#fff",
        padding: this.remCalc(30, 30, 40)
      }
    };

    return (
      <div
        style={styles.container}
        className="markdown-body"
        dangerouslySetInnerHTML={{__html: this.state.content || "Loading..." }}
      />
    );
  },
  componentDidMount() {
    this.fetchContent(this.props.componentName);
  },
  componentWillReceiveProps(newProps) {
    if (this.props.componentName != newProps.componentName) {
      this.setState({ content: "" });
      this.fetchContent(newProps.componentName);
    }
  },
  fetchContent(componentName) {
    window.fetch(`/api/docs/${ componentName }`).then((response) => {
      response.json().then((data) => {
        this.setState({ content: data.doc });
      });
    });
  }
});

export default Readme;
