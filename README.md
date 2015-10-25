# vile-csslint

A [vile](http://vile.io) plugin for [csslint](http://csslint.net).

## Requirements

- [nodejs](http://nodejs.org)
- [npm](http://npmjs.org)

## Installation

    npm i vile-csslint

## Configuration

If you have a `.csslintrc` in your `pwd` it will be used.

```yml
csslint:
  config: .csslintrc
```

### Ignoring Files

If you have a `.csslintignore` file, you can have
`--exclude-list` entries in it.

Example:

```
[
  "bower_components",
  "node_modules"
]
```

Then, in your `.vile.yml`:

```yml
csslint:
  ignore: .csslintignore
```

You can also inline an array:

```yml
csslint:
  ignore: [
      "node_modules",
      "bower_components"
    ]
```

Note: The `.csslintignore` file is specific to `vile`.

## Architecture

- `bin` houses any shell based scripts
- `src` is es6+ syntax compiled with [babel](https://babeljs.io)
- `lib` generated js library

## Hacking

    cd vile-csslint
    npm install
    npm run dev
    npm test
