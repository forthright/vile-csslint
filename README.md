# vile-csslint

A [vile](https://vile.io) plugin for [csslint](http://csslint.net).

**NOTICE**

This project is not actively maintained. If you want to
help maintain the project, or if you have a better
alternative to switch to, please open an issue and ask!

## Requirements

- [nodejs](http://nodejs.org)
- [npm](http://npmjs.org)

## Installation

    npm i csslint --save-dev
    npm i @forthright/vile --save-dev
    npm i @forthright/vile-csslint --save-dev

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
