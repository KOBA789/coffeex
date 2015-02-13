var assert = require('assert');

var React = require('react');

function NOOP () { /* NOOP */  }

function cfx (fn) {
  var isRoot = true,
      stack = [],
      current = [];
  fn(function $ (tag, attr, children) {
    if (arguments.length === 1) {
      attr = {};
      children = NOOP;
    } else if (arguments.length === 2) {
      if (typeof attr === 'object') {
        children = NOOP;
      } else {
        children = attr;
        attr = {};      
      }
    }

    if (isRoot && current.length > 0) {
      throw new SyntaxError('root node must be only one');
    }

    stack.push(current);
    current = [];
    isRoot = false;
    if (typeof children === 'string') {
      current.push(children);
    } else {
      children();
    }
    var elem = React.createElement(tag, attr, current);
    current = stack.pop();
    current.push(elem);
  }, function _ (text) {
    current.push(text);
  });
  return current[0];
}

module.exports = cfx;
