/*jshint esnext:true, browserify:true, unused:true */
'use strict';

import React from 'react/addons';
import {Tabs, Tab} from './tabs-component.jsx';

let Pagination = React.createClass({
  propTypes: {
    currentPage: React.PropTypes.number.isRequired,
    perPage: React.PropTypes.number.isRequired,
    totalItems: React.PropTypes.number.isRequired
  },
  render() {
    return (
      <Tabs>
        <Tab {...this.props}
          query={ Object.assign({}, this.props.query, {page: this.previousPage()}) }
          disabled={this.props.currentPage <= 1}>
            Previous
        </Tab>
        <Tab {...this.props}
          query={ Object.assign({}, this.props.query, {page: this.nextPage()}) }
          disabled={this.props.currentPage >= this.lastPage()}>
            Next
        </Tab>
      </Tabs>
    );
  },
  lastPage() {
    return Math.ceil(this.props.totalItems / this.props.perPage);
  },
  previousPage() {
    // Math.min is only done to deal with tempered page numbers (such as -1)
    return Math.min(this.lastPage(), this.props.currentPage - 1);
  },
  nextPage() {
    // Math.max is only done to deal with tempered page numbers (such as -1)
    return Math.max(1, this.props.currentPage + 1);
  }
});

export default Pagination;
