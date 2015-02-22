# CoffeeX

Coffee DSL for React Virtual DOM instead of JSX

This is inspired by [coffeekup](https://github.com/mauricemach/coffeekup) and [vk](https://github.com/mizchi/vk)

## Usage

In JavaScript
```js
React.createElement('div', {}, [
  React.createElement('h1', { style: { textAlign: 'center' } }, [
    React.createElement('span', {}, [
      'text',
      React.createElement('br'),
      'text',
      React.createElement('br'),
      'text',
      React.createElement('br')
    ])
  ]),
  React.createElement('h2', {}, [
    'text1',
    React.createElement('br'),
    'text2'
  ])
]);
```

In CoffeeX: 
```coffee
cfx ($, _) ->
  $.div ->
    $.h1 style: { textAlign: 'center' }, ->
      $.span ->
        for i in [1..3]
          _ 'text'
          $.br
    $.h2 ->
      _ 'text1'
      $.br
      _ 'text2'
```

## API

### `cfx: Function`

`cfx(block: Function($, _))`

### `$: Function`

Example:

```coffee
$ 'div', '#main.container', { style: { width: '960px' } }, ->
  # children...
```

Arguments Pattern:

| tag name (String) <br> / component (ReactComponent) | id and class <br> (CSSSelectorString) | attribute <br> (Object) | children <br> (Function / String) |
|:---------------------------------------------------:|:--------------------------------:|:------------------:|:----------------------------:|
| ✓                                                   | ✓                                | ✓                  | ✓                            |
| ✓                                                   | ✓                                | ✓                  |                              |
| ✓                                                   | ✓                                |                    | ✓                            |
| ✓                                                   |                                  | ✓                  | ✓                            |
|                                                     | ✓                                | ✓                  | ✓                            |
| ✓                                                   | ✓                                |                    |                              |
| ✓                                                   |                                  | ✓                  |                              |
| ✓                                                   |                                  |                    | ✓                            |
|                                                     |                                  | ✓                  | ✓                            |
| ✓                                                   |                                  |                    |                              |
