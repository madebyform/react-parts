/*jshint esnext:true, browserify:true, unused:true */
'use strict';

import React from 'react/addons';
import StylingMixin from './styling-mixin.jsx';
import DebounceInput from 'react-debounce-input';

let Navbar = React.createClass({
  mixins: [StylingMixin],
  propTypes: {
    title: React.PropTypes.string.isRequired,
    height: React.PropTypes.string.isRequired,
    defaultValue: React.PropTypes.string,
    onSearch: React.PropTypes.func
  },
  getDefaultProps() {
    return {
      onSearch() {}
    };
  },
  render() {
    let styles = {
      container: {
        alignItems: "center",
        background: "#253b6b",
        boxSizing: "border-box",
        color: "#fff",
        display: "flex",
        height: this.props.height,
        overflow: "hidden"
      },
      left: {
        WebkitBoxFlex: 1,
        flex: 1
      },
      logo: {
        float: "right",
        height: this.remCalc(62),
        width: this.remCalc(62)
      },
      center: {
        WebkitBoxFlex: 1,
        alignItems: "center",
        background: "#4b67a5 url(/search.svg) no-repeat 16px center",
        backgroundSize: "auto 100%",
        flex: 1,
        flexGrow: 4,
        height: "100%",
        justifyContent: "center",
        marginLeft: this.remCalc(12),
        maxWidth: this.remCalc(710),
        paddingRight: this.remCalc(10)
      },
      search: {
        background: "transparent",
        border: "none",
        boxSizing: "border-box",
        fontSize: this.remCalc(19),
        height: "100%",
        outline: "none",
        paddingBottom: this.remCalc(4),
        paddingLeft: this.remCalc(50),
        width: "100%"
      },
      right: {
        WebkitBoxFlex: 1,
        background: "#4b67a5",
        height: "100%",
        flex: 1
      },
      link: {
        background: "#253b6b",
        borderRadius: this.remCalc(2),
        boxSizing: "border-box",
        color: "#fff",
        display: "block",
        float: "right",
        fontSize: this.remCalc(17),
        fontWeight: 300,
        margin: this.remCalc(7),
        minWidth: this.remCalc(186),
        padding: this.remCalc(8, 20),
        textAlign: "center",
        textDecoration: "none"
      }
    };
    return (
      <div className="Navbar u-displayFlex" style={styles.container}>
        <div style={styles.left}>
          <a href="/">
            <img style={styles.logo} src="/react-logo.svg" alt="Logo" draggable="false" />
          </a>
        </div>
        <form style={styles.center} action="" onSubmit={this.handleSubmit}>
          <DebounceInput
            className="u-forceSmall16"
            name="search"
            ref="search"
            style={styles.search}
            type="text"
            placeholder="Search"
            onChange={this.handleChange}
            minLength={0}
            debounceTimeout={300}
            value={this.props.defaultValue || ""}
            autoCapitalize="off"
            autoCorrect="off"
            spellCheck="false"
          />
        </form>
        <div style={styles.right}>
          <a className="u-hideSmall" style={styles.link}
            href="https://github.com/madebyform/react-parts#start-of-content">
              Submit a component
          </a>
        </div>
      </div>
    );
  },
  shouldComponentUpdate() {
    // This is a simple way of allowing the user to type while the search results
    // are updated, without flickering the input or changing it's value
    return false;
  },
  handleChange(value) {
    this.props.onSearch(value.trim());
  },
  handleSubmit(e) {
    // When the user presses <return> nothing should happen
    e.preventDefault();
  }
});

export default Navbar;
