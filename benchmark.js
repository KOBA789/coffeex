// Generated by CoffeeScript 1.9.1
(function() {
  var React, cfx, i, j, k;

  React = require('react');

  cfx = require('./');

  debugger;

  console.time("timer1");

  for (i = j = 0; j <= 10000; i = ++j) {
    (cfx(function($, _) {
      return $('div');
    }))();
  }

  console.timeEnd("timer1");

  debugger;

  console.time("timer2");

  for (i = k = 0; k <= 10000; i = ++k) {
    React.createElement('div', {}, []);
  }

  console.timeEnd("timer2");

  debugger;

}).call(this);
