/*jshint node:true */
'use strict';

// Start by registering a hook that makes calls to `require` run ES6 code
// This will be the only file where JSX and ES6 features are not supported
require('babel/register');

var fs = require('fs');
var ejs = require('ejs');
var React = require('react');

// The catalog of react packages
var components = require('./data.json');

// Make the components catalog available globally
global.components = components;

// Require and wrap the React main component in a factory before calling it
// This is necessary because we'll do `App()` instead of <App />
var App = React.createFactory(require("./src/app.jsx").App);

// Render the app and send the markup for faster page loads and SEO
// On the client, React will preserve the markup and only attach event handlers
function render(templateFile, app, components) {
  var output = React.renderToString(app);

  // Use Embedded JavaScript to embed the output from React into our layout
  return ejs.render(fs.readFileSync(templateFile, "utf8"), {
    output: output,
    components: components
  });
}

var html = render("template.ejs", new App(), components);
fs.writeFileSync("index.html", html);
