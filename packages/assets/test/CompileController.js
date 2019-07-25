/* eslint-disable max-len */
import test from 'ava'
import './helpers/request'
import '../src/AssetsProvider'

function get(path, full = false, options = { }) {
	return request(app => {
		AssetsProvider(app)
	}, `assets/${path}`, options).then(async response => {
		if(full) {
			return response
		}

		return (await response.text()).trim()
	})
}

test('css', async t => {
	const css = await get('css/test-all.css')
	t.is(css, 'body{margin:0;padding:0;background:#fff}strong{font-weight:900}::-webkit-input-placeholder{color:gray}::-moz-placeholder{color:gray}:-ms-input-placeholder{color:gray}::-ms-input-placeholder{color:gray}::placeholder{color:gray}')
})

test('scss', async t => {
	const scss = await get('scss/test-all.scss')
	t.is(scss, 'body{margin:0;padding:0;background:#fff}body ::-webkit-input-placeholder{color:gray}body ::-moz-placeholder{color:gray}body :-ms-input-placeholder{color:gray}body ::-ms-input-placeholder{color:gray}body ::placeholder{color:gray}')
})

test('js', async t => {
	const js = await get('js/test.js')
	t.is(js, 'document.body.getElementById("test").style.border="none";')
})

test('babel', async t => {
	const js = await get('babel/test.js')
	t.is(js, '!function u(i,f,a){function c(r,e){if(!f[r]){if(!i[r]){var n="function"==typeof require&&require;if(!e&&n)return n(r,!0);if(l)return l(r,!0);var t=new Error("Cannot find module \'"+r+"\'");throw t.code="MODULE_NOT_FOUND",t}var o=f[r]={exports:{}};i[r][0].call(o.exports,function(e){return c(i[r][1][e]||e)},o,o.exports,u,i,f,a)}return f[r].exports}for(var l="function"==typeof require&&require,e=0;e<a.length;e++)c(a[e]);return c}({1:[function(e,r,n){"use strict";function t(e,r){for(var n=0;n<r.length;n++){var t=r[n];t.enumerable=t.enumerable||!1,t.configurable=!0,"value"in t&&(t.writable=!0),Object.defineProperty(e,t.key,t)}}Object.defineProperty(n,"__esModule",{value:!0}),n.Test=void 0;var o=function(){function e(){!function(e,r){if(!(e instanceof r))throw new TypeError("Cannot call a class as a function")}(this,e)}return function(e,r,n){r&&t(e.prototype,r),n&&t(e,n)}(e,[{key:"test",value:function(){return document.body.getElementById("test")}}]),e}();n.Test=o},{}]},{},[1]);')
})

test('svg', async t => {
	const svg = await get('img/test.svg')
	t.is(svg, '<svg width="108" height="108" xmlns="http://www.w3.org/2000/svg"><path fill="#000" d="M4 2h100v100H4z" fill-rule="evenodd"/></svg>')
})

test('security', async t => {
	try {
		await get('../config/assets.json')
		t.fail('Allowed illegal path')
	} catch(err) {
		t.is(err.statusCode, 404)
	}
})

test('headers', async t => {
	const response = await get('css/test.css', true)
	t.is(response.headers.get('x-cached'), 'false')
	t.is(response.headers.get('cache-control'), 'public, max-age=31536000')
	t.is(response.headers.get('content-type'), 'text/css; charset=utf-8')
	t.is(response.headers.get('content-length'), '63')
	t.is(response.headers.get('access-control-allow-origin'), '*')
	t.is((response.headers.get('last-modified') || '').length > 0, true)
	t.is((response.headers.get('expires') || '').length > 0, true)
	t.is((response.headers.get('etag') || '').length > 0, true)
})

test('cached', async t => {
	const response = await get('css/test.css', true)

	try {
		await get('css/test.css', true, {
			headers: {
				'If-None-Match': response.headers.get('etag')
			}
		})

		t.fail('Returned full asset instead of 304')
	} catch(err) {
		t.is(err.status, 304)
	}
})
