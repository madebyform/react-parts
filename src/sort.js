/*jshint esnext:true, node:true */
'use strict';

/*
  * Allows for
  var unsorted = [{"x": {"y": 10}},{"x": {"y": 30}},{"x" :{"y": 20}}];
  unsorted.sort(sortBy("x.y", Number));
  * resulting in:
  [{"x": {"y": 30}},{"x": {"y": 20}},{"x" :{"y": 10}}];
*/
var sortBy = function(prop, Klass, asc) {
  let dotRedux = function(prev, curr){
    return prev[curr];
  };

  return function(a, b) {
    let propA = new Klass(prop.split(".").reduce(dotRedux, a));
    let propB = new Klass(prop.split(".").reduce(dotRedux, b));

    if (propA < propB) {
      return asc ? -1 : 1;
    }
    if (propA > propB) {
      return asc ? 1 : -1;
    }
    return 0;
  };
};

export default sortBy;
