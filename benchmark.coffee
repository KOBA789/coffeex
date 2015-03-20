React = require 'react'

cfx = require './'

console.time("timer1")
(cfx ($, _) ->
  $.div ->
    for i in [0..10000]
      $.div '#hoge.c1.c2')()
console.timeEnd("timer1")

console.time("timer2")
React.createElement('div', {}, 
  for i in [0..10000]
    React.createElement('div', { id: 'hoge', className: { c1:true, c2: true } }, []))
console.timeEnd("timer2")
