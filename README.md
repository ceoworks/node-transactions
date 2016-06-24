# `Node Transactions`

[![Build Status](https://secure.travis-ci.org/ceoworks/node-transactions.png?branch=master)](http://travis-ci.org/ceoworks/node-transactions)
[![Coverage Status](https://coveralls.io/repos/ceoworks/node-transactions/badge.svg)](https://coveralls.io/r/ceoworks/node-transactions)
[![npm](https://img.shields.io/npm/dt/n.svg?style=flat-square)](https://www.npmjs.com/package/node-transactions)
[![npm](https://img.shields.io/npm/dm/n.svg?style=flat-square)](https://www.npmjs.com/package/node-transactions)
[![npm](https://img.shields.io/npm/v/n.svg?style=flat-square)](https://www.npmjs.com/package/node-transactions)
[![npm](https://img.shields.io/npm/l/n.svg?style=flat-square)](https://www.npmjs.com/package/node-transactions)

## Usage
Examples of code are shown in ./test/index.spec.js

In case you are already using `generators-yields` functions - you are completely set up.

If you are writing classic `async-callback` code - you would probably like to look at `thunkify` package.

##API
The first thing you need is the `context` object, which would have all *required* data for tasks execution.
```javascript
let context = {
	lannisters: false,
	starks: true
}
```

The main brick of the *`Node Transactions`* module is a `task`:
```javascript
task = {
	name: 'westeros',
	perform: function *doYourJob() { ... },
	rollback: function *revertChanges() { ... }
};
```

When you have prepared bunch of `tasks` and `context` - simply launch Transactions engine:
```javascript
let result = yield new Transactions([task, nextTask, ...], context);
```

`result` would have next properties:
1. `result.success` - `enum: [true, false]`
2. `result.context[task.name].performResult` - the result of successful execution of `tesk.perform`
3. `result.error` - the first and only `task.perform` error (only if `result.success === false`)
4. `result.rollbackErrors` - array of possible `task.rollback` errors

## Issues
Any bugs or improvements are appreciated and could be posted at https://github.com/ceoworks/node-transactions/issues
