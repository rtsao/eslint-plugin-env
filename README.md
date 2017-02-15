# eslint-plugin-env


[![build status][build-badge]][build-href]
[![dependencies status][deps-badge]][deps-href]
[![npm version][npm-badge]][npm-href]

Environment-based linting rules for ESLint

## Usage

In your ESLint configuration:
```js
{
  plugins: [
    'eslint-plugin-env' // 'env' shorthand also works
  ],
 
  rules: {
    'no-undef': 'off', // ensure the standard `no-undef` is off
    'env/no-undef-env': ['error', {identifier: 'APP_ENV'}], // Optional, `APP_ENV` is the default value
  },
  
  env: {
    // only allow globals that work in both node and browser
    'shared-node-browser': true,
    es6: true
  }
}
```

In your Webpack configuration:
```js
{
  plugins: [
    new webpack.DefinePlugin({APP_ENV: 'browser'}) // or 'node' for server webpack config
  ]
}
```

In your application code:
```js
window; // lint error, undefined variable
__dirname; // lint error, undefined variable

if (APP_ENV === 'browser') {
  window; // no lint error
}

if (APP_ENV === 'node') {
  __dirname; // no lint error
}
```

## Why?

In universal code (run in the browser and in node), a statically available environment variable should be used. In this case, minifiers (e.g. Uglify) can eliminate dead code. If the environment isn't static, then dead code can't be eliminated.

This lint rule allows ensures browser and node globals are only defined within a corresponding static environment check conditional.

[build-badge]: https://travis-ci.org/rtsao/eslint-plugin-env.svg?branch=master
[build-href]: https://travis-ci.org/rtsao/eslint-plugin-env
[deps-badge]: https://david-dm.org/rtsao/eslint-plugin-env.svg
[deps-href]: https://david-dm.org/rtsao/eslint-plugin-env
[npm-badge]: https://badge.fury.io/js/eslint-plugin-env.svg
[npm-href]: https://www.npmjs.com/package/eslint-plugin-env
