# vile-csslint

A [vile](http://vile.io) plugin for [csslint](http://csslint.net).

## Requirements

- [nodejs](http://nodejs.org)
- [npm](http://npmjs.org)

## Installation

    npm i vile-csslint

## Configuration

If you have a `.csslintrc` in your project root, it will be used.

## Architecture

- `bin` houses any shell based scripts
- `src` is es6+ syntax compiled with [babel](https://babeljs.io)
- `lib` generated js library

## Hacking

    cd vile-csslint
    npm install
    npm run dev
    npm test
