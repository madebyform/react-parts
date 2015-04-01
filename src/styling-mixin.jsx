/*jshint esnext:true, browserify:true */
/*globals components */
'use strict';

/*
 * Styling Mixin
 *
 * Simple mixin with utility methods for styling components.
 */
let StylingMixin = {
  // This is the `m` method from "CSS in JS" (goo.gl/ZRKFcR). It simply merges an
  // arbitrary number of given objects. Useful for conditionals. Usage example:
  //    this.mergeStyles(
  //      styles.example,
  //      isOpen && styles.open
  //    )
  mergeStyles(...args) {
    return Object.assign({}, ...args);
  },
  //
  // Convert a list of values in pixels to rems. For example:
  //    remCalc(16, 18, 32) # returns "1rem 1.125rem 2rem"
  // @param {Integer} remBase — The base body font size value in pixels
  // @param {Array} values — One or more values in pixels to be converted to rem
  // @return {String} Space delimited values that can be used in css styles
  //
  remCalc(...values) {
    let remBase = 16; // The base body font size value in pixels
    return values.map((value) => `${value/remBase}rem`).join(" ");
  }
};

export default StylingMixin;
