var assert = require('assert');

var React = require('react'),
    parseful = require('parseful');

function NOOP () { /* NOOP */  }

var p = parseful.define('cssSelector', function (c, $, _) {
  var a = c.action,
      chr = function (e) {
        return c.satisfy(function (c) {
          return c === e;
        });
      },
      letter = c.satisfy(function (c) {
        return /^[a-zA-Z]$/.test(c);
      }),
      digit = c.satisfy(function (c) {
        return /^[0-9]$/.test(c);
      }),
      optional = function (p) {
        return c.choice([p, parseful.Unit]);
      };

  return {
    'cssIdent': a($(a(optional(chr('-')), function (r) { return r === parseful.Unit ? '' : r; }),
                  a(c.many1(c.choice([chr('_'), letter])), function (list) { return list.join(''); }),
                  a(c.many(c.choice([chr('_'), letter, digit, chr('-')])), function (list) { return list.join(''); })),
                  function (list) { return list.join(''); }),
    'class': $(chr('.'), _('cssIdent')),
    'id': $(chr('#'), _('cssIdent')),
    'cssSelector': a(c.choice([
      a($(c.many(_('class')),
          a(_('id'), function (id) { return [id]; }),
          c.many(_('class'))),
        function (list) {
          return list.reduce(function (prev, curr) { return prev.concat(curr); }, []);
        }),
      c.many1(_('class'))
    ]), function (list) {
      return list.reduce(function (r, selector) {
        switch (selector[0]) {
        case '.':
          if (!r.hasOwnProperty('classes')) {
            r.classes = {};
          }
          r.classes[selector[1]] = true;
          break;
        case '#':
          r.id = selector[1];
          break;
        }
        return r;
      }, {});
    })
   };
});

function parseCssSelector (input) {
  var s = new parseful.State(0, input.split('')),
      r = p(s);
  if (s.peek === parseful.Nothing) {
    return r;
  } else {
    return null;
  }
}

function Context (params) {
  this.params = params;
  this.stack = [];
  this.current = [];
}

Context.prototype.createElement = function createElementWrapper () {
  var alreadyCreated = false;

  function createElement (tag, selectorStr, attr, children) {
    var selector = null;
    switch (arguments.length) {
    case 4:
      selector = parseCssSelector(selectorStr);
      break;
    case 3:
      selector = parseCssSelector(tag);
      if (selector === null) {
        if (typeof selectorStr === 'string') {
          selector = parseCssSelector(selectorStr);
          if (typeof attr === 'object') {
            children = NOOP;
          } else {
            children = attr;
            attr = {};
          }
        } else {
          children = attr;
          attr = selectorStr;
        }
      } else {
        children = attr;
        attr = selector;
        tag = 'div';
      }
      break;
    case 2:
      if (typeof tag === 'string') {
        if (typeof selectorStr === 'object') {
          children = NOOP;
          attr = selectorStr;
        } else {
          if (typeof selectorStr === 'function') {
            children = selectorStr;
            attr = {};
          } else {
            selector = parseCssSelector(selectorStr);
            if (selector === null) {
              attr = {};
              children = selectorStr;
            } else {
              attr = {};
              children = NOOP;
            }
          }
        }
      } else {
        children = selectorStr;
        attr = null;
        selector = null;
      }
      break;
    case 1:
      attr = {};
      children = NOOP;
      break;
    }

    assert(typeof tag === 'string');
    assert(typeof selector === 'object');
    assert(typeof attr === 'object');
    assert(typeof children === 'function' || typeof children === 'string');

    if (alreadyCreated) {
      this.current.pop();
    }
    alreadyCreated = true;
    
    if (this.stack.length === 0 && this.current.length > 0) {
      console.log(this.current, tag, attr, children);
      throw new SyntaxError('root node must be only one');
    }

    var className = {};
    if (attr.hasOwnProperty('className')) {
      if (typeof attr.className === 'string') {
        attr.className.split(/\s+/).forEach(function (name) {
          className[name] = true;
        });
      } else {
        Object.keys(attr.className).forEach(function (name) {
          if (attr.claasName[name]) {
            className[name] = true;
          }
        });
      }
    }
    
    if (selector !== null) {
      if (selector.hasOwnProperty('id') && !attr.hasOwnProperty('id')) {
        attr.id = selector.id;
      }
      if (selector.hasOwnProperty('classes')) {
        Object.keys(selector.classes).forEach(function (name) {
          if (selector.classes[name] && !className.hasOwnProperty(name)) {
            className[name] = true;
          }
        });
      }
    }

    if (Object.keys(className).length > 0) {
      attr.className = Object.keys(className).join(' ');
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
    return tag;
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
