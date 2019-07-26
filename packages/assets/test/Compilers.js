/* eslint-disable max-len */
import test from 'ava'
import './helpers/Grind'

import {
	BabelCompiler,
	RawCompiler,
	ScssCompiler
} from '../src'

function compile(compiler, file, hook = () => { }, ...args) {
	if(typeof hook !== 'function') {
		args.unshift(hook)
		hook = () => { }
	}

	const app = new Grind
	app.config.loadDefault('assets', app.paths.base('../../config/assets.json'))
	hook(app)

	return (new compiler(app)).compile(app.paths.base('resources/assets', file), ...args)
}

test('scss', async t => {
	const scss = await compile(ScssCompiler, 'scss/test.scss', 'compressed')
	t.is(scss.toString().trim(), 'body{margin:0;padding:0}body strong{font-weight:900}')
})

test('babel', async t => {
	let js = await compile(BabelCompiler, 'babel/test.js')

	js = js.toString()

	t.is(js.trim(), `
(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Test = void 0;

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

/* global document */
var Test =
/*#__PURE__*/
function () {
  function Test() {
    _classCallCheck(this, Test);
  }

  _createClass(Test, [{
    key: "test",
    value: function test() {
      return document.body.getElementById('test');
    }
  }]);

  return Test;
}();

exports.Test = Test;

},{}]},{},[1]);
`.trim())
})

test('rollup', async t => {
	const js = await compile(BabelCompiler, 'babel/rollup/main.js', app => {
		app.config.set('assets.compilers.babel.rollup.enabled', true)
		app.config.set('assets.compilers.babel.browserify.enabled', false)
	})

	t.is(js.toString().trim(), `
'use strict';

var testing = true;

var i = /*#__PURE__*/Object.freeze({
	testing: testing
});

console.log('testing', i);
`.trim())
})

test('rollup/process.env.NODE_ENV', async t => {
	const js = await compile(BabelCompiler, 'babel/rollup/env.js', app => {
		app.config.set('assets.compilers.babel.browserify.enabled', false),
		app.config.set('assets.compilers.babel.rollup.enabled', true)
		app.config.set('assets.compilers.babel.rollup.plugins', { })
		app.config.set('assets.compilers.babel.rollup.plugins.rollup-plugin-replace', { })
	})

	t.is(js.toString().trim(), `
'use strict';

{
  console.log('test env');
}
`.trim())
})

test('rollup+browserify', async t => {
	const js = await compile(BabelCompiler, 'babel/rollup/main.js', app => {
		app.config.set('assets.compilers.babel.rollup.enabled', true)
	})

	t.is(js.toString().trim(), `
(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
'use strict';

var testing = true;

var i = /*#__PURE__*/Object.freeze({
	testing: testing
});

console.log('testing', i);

},{}]},{},[1]);
`.trim())
})

test('raw', async t => {
	const svg = await compile(RawCompiler, 'img/test-raw.svg')
	t.is(svg.toString().trim(), '<?xml version="1.0" encoding="UTF-8"?>\n<svg></svg>')
})
