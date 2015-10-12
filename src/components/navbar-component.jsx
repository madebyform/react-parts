/*jshint esnext:true, browserify:true, unused:true */
'use strict';

import React from 'react/addons';
import shallowEqual from 'react/lib/shallowEqual';
import StylingMixin from '../helpers/styling-mixin.jsx';
import DebounceInput from 'react-debounce-input';

let Navbar = React.createClass({
  mixins: [StylingMixin],
  propTypes: {
    title: React.PropTypes.string.isRequired,
    height: React.PropTypes.string.isRequired,
    defaultValue: React.PropTypes.string,
    onSearch: React.PropTypes.func,
    largeSearch: React.PropTypes.bool,
    searchMaxWidth: React.PropTypes.number
  },
  getDefaultProps() {
    return {
      onSearch() {},
      largeSearch: false,
      searchInputMaxWidth: 0
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
        flex: 1,
        minWidth: this.remCalc(80)
      },
      logo: {
        float: "right",
        height: this.remCalc(62),
        width: this.remCalc(62)
      },
      center: {
        WebkitBoxFlexBasis: 1,
        flexBasis: 1,
        WebkitBoxFlexGrow: (this.props.largeSearch ? 12 : 3),
        flexGrow: (this.props.largeSearch ? 16 : 3),
        alignItems: "center",
        background: "#4b67a5 url(/search.svg) no-repeat 16px center",
        backgroundSize: "auto 100%",
        height: "100%",
        justifyContent: "center",
        marginLeft: this.remCalc(12),
        maxWidth: this.remCalc(this.props.searchMaxWidth - 10),
        paddingRight: this.remCalc(10),
        boxSizing: "border-box"
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
  shouldComponentUpdate(nextProps) {
    // If what changed was the `defaultValue` for the input, don't update the view.
    // This prevents the input from flickering while the user rights.
    let props = Object.assign({}, this.props, { defaultValue: "" });
    nextProps = Object.assign({}, nextProps, { defaultValue: "" });
    return !shallowEqual(props, nextProps);
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
