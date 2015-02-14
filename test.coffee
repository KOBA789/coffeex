assert = require 'assert'

React = require 'react'

cfx = require './'

case1 =
  actual:
    cfx ($, _) ->
      $.div ->
        $.h1 key: 1, style: { textAlign: 'center' }, ->
          $.span ->
            for i in [1..3]
              _ 'text'
              $.br key: i
        $ 'h2', key: 2, ->
          _ 'text1'
          $ 'br', key: 1
          _ 'text2'
        $.h3 key: 3, 'h3 text'

  expected:
    React.createElement('div', {}, [
      React.createElement('h1', { key: 1, style: { textAlign: 'center' } },
        React.createElement('span', {}, [
          'text',
          React.createElement('br', { key: 1 }),
          'text',
          React.createElement('br', { key: 2 }),
          'text',
          React.createElement('br', { key: 3 })
        ])
      ),
      React.createElement('h2', { key: 2 }, [
        'text1',
        React.createElement('br', { key: 1 }),
        'text2'
      ]),
      React.createElement('h3', { key: 3 }, 'h3 text')
    ])

#console.log React.renderToStaticMarkup(case1.actual)
#console.log React.renderToStaticMarkup(case1.expected)
#util = require 'util'
#console.log util.inspect case1.actual, depth: null
#console.log util.inspect case1.expected, depth: null

assert.deepEqual(case1.actual, case1.expected)
