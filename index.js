var assert = require('assert');

var React = require('react');

function NOOP () { /* NOOP */  }

var CSS_IDENT = /^-?(?:[_a-z]|[\240-\377]|(?:(:?\\[0-9a-f]{1,6}(\r\n|[ \t\r\n\f])?)|\\[^\r\n\f0-9a-f]))(?:[_a-z0-9-]|[\240-\377]|(?:(:?\\[0-9a-f]{1,6}(\r\n|[ \t\r\n\f])?)|\\[^\r\n\f0-9a-f]))*/;

var parseCssSelectorMemo = {};

function parseCssSelector (input) {
  if (parseCssSelectorMemo.hasOwnProperty(input)) {
    return parseCssSelectorMemo[input];
  }
  
  function parseIdent (input) {
    var match = input.match(CSS_IDENT);
    if (match === null) {
      throw new SyntaxError('illegal CSS ident');
    }
    return match[0];
  }

  var result = { classes: {} };

  for (var next = input; next.length > 0; ) {
    switch (next[0]) {
    case '#':
      if (result.hasOwnProperty('id')) {
        throw new SyntaxError('id is already set: ' + result.id);
      }
      result.id = parseIdent(next.substring(1));
      next = next.substring(result.id.length + 1);
      break;
    case '.':
      var className = parseIdent(next.substring(1));
      if (result.classes.hasOwnProperty(className)) {
        throw new SyntaxError('class is duplicated: ' + className);
      }
      result.classes[className] = true;
      next = next.substring(className.length + 1);
      break;
    default:
      if (next.length === input.length) {
        return null;
      } else {
        throw new SyntaxError('unexpected char: ' + next[0]);
      }
    }
  }

  parseCssSelectorMemo[input] = result;
  return result;
}

function Nothing () { return Nothing; }

var m = {
  tag: {
    name: 'tag',
    cond: function tag (val) {
      if (typeof val === 'string' && parseCssSelector(val) === null) {
        // tag
        return val;
      } else if (typeof val === 'function') {
        // component
        return val;
      }

      return Nothing;
    }
  },
  selector: {
    name: 'selector',
    cond: function (val) {
      if (typeof val !== 'string') { return Nothing; }

      var parsed = parseCssSelector(val);
      if (parsed === null) { return Nothing; }

      return parsed;
    }
  },
  attr: {
    name: 'attr',
    cond: function attr (val) {
      return (typeof val === 'object') ? val : Nothing;
    }
  },
  children: {
    name: 'children',
    cond: function children (val) {
      return (typeof val === 'function' || typeof val === 'string') ? val : Nothing;
    }
  }
};

function createMatcher (patterns) {
  var patternsMap = patterns.reduce(function (memo, pattern) {
    if (!memo.hasOwnProperty(pattern.length)) {
      memo[pattern.length] = [];
    }
    memo[pattern.length].push(pattern);

    return memo;
  }, {});

  return function match (args) {
    var pattens = patternsMap[args.length],
        i = 0, k = 0, ret = {}, pattern, arg;

    outer:
    for (i = 0; i < patterns.length; ++i) {
      ret = { selector: { classes: {} }, attr: {}, children: NOOP };

      pattern = patterns[i];
      for (k = 0; k < pattern.length; ++k) {
        arg = pattern[k];
        if ((ret[arg.name] = arg.cond(args[k])) === Nothing) {
          continue outer;
        }
      }

      return ret;
    }
  };
}

var match = createMatcher([
  [m.tag, m.selector, m.attr, m.children],
  [m.tag, m.selector, m.attr            ],
  [m.tag, m.selector,         m.children],
  [m.tag,             m.attr, m.children],
  [       m.selector, m.attr, m.children],

  [m.tag, m.selector                    ],
  [m.tag,             m.attr            ],
  [m.tag,                     m.children],
  [                   m.attr, m.children],

  [m.tag                                ]
]);

function Context (params, that) {
  this.params = params;
  this.stack = [];
  this.current = [];
  this.that = that;
}

Context.prototype.createElement = function createElementWrapper () {
  var alreadyCreated = false;

  function createElement () {
    var args = match(arguments);

    if (alreadyCreated) {
      this.current.pop();
    }
    alreadyCreated = true;

    if (this.stack.length === 0 && this.current.length > 0) {
      throw new SyntaxError('root node must be only one');
    }

    var className = {};
    if (args.attr.hasOwnProperty('className')) {
      if (typeof args.attr.className === 'string') {
        args.attr.className.split(/\s+/).forEach(function (name) {
          className[name] = true;
        });
      } else {
        Object.keys(args.attr.className).forEach(function (name) {
          if (args.attr.claasName[name]) {
            className[name] = true;
          }
        });
      }
    }
    
    // if both of attr's `id` and selector's `id` are given,
    // use attr's `id` rather than selector's `id`
    if (args.selector.hasOwnProperty('id') && !args.attr.hasOwnProperty('id')) {
      args.attr.id = args.selector.id;
    }

    Object.keys(args.selector.classes).forEach(function (name) {
      // if `class` is specified in both of attr and selector,
      // use attr's `class` rather than selectors `class`
      if (!className.hasOwnProperty(name)) {
        className[name] = true;
      }
    });

    if (Object.keys(className).length > 0) {
      args.attr.className = Object.keys(className).join(' ');
    }
    
    this.stack.push(this.current);
    this.current = [];
    if (typeof args.children === 'string') {
      this.current.push(args.children);
    } else {
      args.children.call(this.params);
    }
    var elem;
    if (this.current.length === 0) {
      elem = React.createElement(args.tag, args.attr);
    } else {
      if (this.current.length === 1) {
        this.current = this.current[0];
      }
      elem = React.createElement(args.tag, args.attr, this.current);
    }
    this.current = this.stack.pop();
    this.current.push(elem);
    return args.tag;
  }

  var tag = createElement.apply(this, arguments);
  return createElement.bind(this, tag);
};

Context.prototype.createTextNode = function createTextNode (text) {
  this.current.push(text);
};

Context.prototype.getRootNode = function getRootNode () {
  return this.current[0];
};

function cfx (fn) {
  return function render (params) {
    var ctx = new Context(params, this),
        tags = Object.keys(React.DOM),
        $ = ctx.createElement.bind(ctx);

    Object.defineProperties($, tags.reduce(function (desc, tag) {
      desc[tag] = { get: ctx.createElement.bind(ctx, tag) };
      return desc;
    }, {}));

    fn.call(params, $, ctx.createTextNode.bind(ctx), params);
    return ctx.getRootNode();
  };
}

module.exports = cfx;
