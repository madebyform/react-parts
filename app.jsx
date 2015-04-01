/*jshint esnext:true, browserify:true */
'use strict';

import React from 'react';

export var App = React.createClass({
  render() {
    let styles = {
      fontFamily: "Source Sans Pro, monospace",
      fontSize: "20px",
      lineHeight: "1.5",
      margin: "0 auto",
      width: "940px"
    };
    return (
      <div style={styles}>
        <h1>Hello, World!</h1>
      </div>
    );
  }
});

if (typeof(document) !== "undefined") {
  React.render(<App />, document.getElementById("content"));
}
