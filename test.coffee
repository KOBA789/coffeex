assert = require 'assert'

React = require 'react'

cfx = require './'

hogePara = React.createClass(
  render: cfx ($, _) ->
    $.p 'hoge'
)

case1 =
  actual:
    cfx ($, _) ->
      $.div ->
        $.h1 '.title#big-title', key: 1, style: { textAlign: 'center' }, ->
          $.span ->
            for i in [1..3]
              _ @foo
              $.br key: i
        $ 'h2', key: 2, ->
          _ @bar
          $ 'br', key: 1
          _ @bar
        $.h3 key: 3, 'h3 text'
        $.h4 '.subtitle', ->
          _ 'hoge'
        $.h5 'h5 text'
        $ hogePara

  expected: (params) ->
    React.createElement('div', {}, [
      React.createElement('h1', { id: 'big-title', className: 'title', key: 1, style: { textAlign: 'center' } },
        React.createElement('span', {}, [
          params.foo,
          React.createElement('br', { key: 1 }),
          params.foo,
          React.createElement('br', { key: 2 }),
          params.foo,
          React.createElement('br', { key: 3 })
        ])
      ),
      React.createElement('h2', { key: 2 }, [
        params.bar,
        React.createElement('br', { key: 1 }),
        params.bar
      ]),
      React.createElement('h3', { key: 3 }, 'h3 text'),
      React.createElement('h4', { className: 'subtitle' }, 'hoge'),
      React.createElement('h5', {}, 'h5 text'),
      React.createElement(hogePara)
    ])

params =
  foo: 'foo'
  bar: 'bar'

#console.log React.renderToStaticMarkup(case1.actual(params))
#console.log React.renderToStaticMarkup(case1.expected(params))
#util = require 'util'
#console.log util.inspect case1.actual(params), depth: null
#console.log util.inspect case1.expected(params), depth: null

assert.deepEqual(case1.actual(params), case1.expected(params))
