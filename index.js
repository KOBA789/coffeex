var assert = require('assert');

var React = require('react');

function NOOP () { /* NOOP */  }

function Context (params) {
  this.params = params;
  this.stack = [];
  this.current = [];
}

Context.prototype.createElement = function createElement (tag, attr_, children_) {
  var elem = React.createElement(tag);
  this.current.push(elem);
  
  var opts = function (attr, children) {
    if (typeof attr !== 'object') {
      children = attr;
      attr = {};      
    }
    if (typeof children !== 'function' && typeof children !== 'string') {
      children = NOOP;
    }

    this.current.pop();
    
    if (this.stack.length === 0 && this.current.length > 0) {
      console.log(this.current, tag, attr, children);
      throw new SyntaxError('root node must be only one');
    }

    this.stack.push(this.current);
    this.current = [];
    if (typeof children === 'string') {
      this.current.push(children);
    } else {
      children.call(this.params);
    }
    var elem;
    if (this.current.length === 0) {
      elem = React.createElement(tag, attr);
    } else {
      if (this.current.length === 1) {
        this.current = this.current[0];
      }
      elem = React.createElement(tag, attr, this.current);
    }
    this.current = this.stack.pop();
    this.current.push(elem);
  }.bind(this);

  if (arguments.length >= 2) {
    return opts(attr_, children_);
  } else {
    return opts;
  }
};

Context.prototype.createTextNode = function createTextNode (text) {
  this.current.push(text);
};

Context.prototype.getRootNode = function getRootNode () {
  return this.current[0];
};

function cfx (fn) {
  return function render (params) {
    var ctx = new Context(params),
        tags = Object.keys(React.DOM),
        $ = ctx.createElement.bind(ctx);

    Object.defineProperties($, tags.reduce(function (desc, tag) {
      desc[tag] = { get: ctx.createElement.bind(ctx, tag) };
      return desc;
    }, {}));
    fn($, ctx.createTextNode.bind(ctx), params);
    return ctx.getRootNode();
  };
}

module.exports = cfx;
