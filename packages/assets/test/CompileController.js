/* eslint-disable max-len */
import test from 'ava'
import './helpers/request'
import '../src/AssetsProvider'

function get(path, full = false, options = { }) {
	return request(app => {
		AssetsProvider(app)
	}, `assets/${path}`, options).then(response => {
		if(full) {
			return response
		}

		return response.body.toString().trim()
	})
}

test('css', async t => {
	const css = await get('css/test-all.css')
	t.is(css, 'body{margin:0;padding:0;background:#fff}strong{font-weight:900}div{-webkit-transform:scale(.5,.5);transform:scale(.5,.5)}')
})

test('scss', async t => {
	const scss = await get('scss/test-all.scss')
	t.is(scss, 'body{margin:0;padding:0;background:#fff}body div{-webkit-transform:scale(.5,.5);transform:scale(.5,.5)}')
})

test('js', async t => {
	const js = await get('js/test.js')
	t.is(js, '!function(){function e(){return document.body.getElementById("test")}e().style.border="none"}();')
})

test('babel', async t => {
	const js = await get('babel/test.js')
	t.is(js, '!function e(r,n,t){function o(i,f){if(!n[i]){if(!r[i]){var a="function"==typeof require&&require;if(!f&&a)return a(i,!0);if(u)return u(i,!0);var c=new Error("Cannot find module \'"+i+"\'");throw c.code="MODULE_NOT_FOUND",c}var l=n[i]={exports:{}};r[i][0].call(l.exports,function(e){var n=r[i][1][e];return o(n?n:e)},l,l.exports,e,r,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}({1:[function(e,r,n){"use strict";function t(e,r){if(!(e instanceof r))throw new TypeError("Cannot call a class as a function")}Object.defineProperty(n,"__esModule",{value:!0});var o=function(){function e(e,r){for(var n=0;n<r.length;n++){var t=r[n];t.enumerable=t.enumerable||!1,t.configurable=!0,"value"in t&&(t.writable=!0),Object.defineProperty(e,t.key,t)}}return function(r,n,t){return n&&e(r.prototype,n),t&&e(r,t),r}}();n.Test=function(){function e(){t(this,e)}return o(e,[{key:"test",value:function(){return document.body.getElementById("test")}}]),e}()},{}]},{},[1]);')
})

test('svg', async t => {
	const svg = await get('img/test.svg')
	t.is(svg, '<svg width="108" height="108" viewBox="0 0 108 108" xmlns="http://www.w3.org/2000/svg"><path fill="#000" d="M4 2h100v100H4z" fill-rule="evenodd"/></svg>')
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
	t.is(response.headers['x-cached'], 'false')
	t.is(response.headers['cache-control'], 'public, max-age=31536000')
	t.is(response.headers['content-type'], 'text/css; charset=utf-8')
	t.is(response.headers['content-length'], '63')
	t.is((response.headers['last-modified'] || '').length > 0, true)
	t.is((response.headers.expires || '').length > 0, true)
	t.is((response.headers.etag || '').length > 0, true)
})

test('cached', async t => {
	const response = await get('css/test.css', true)

	try {
		await get('css/test.css', true, {
			headers: {
				'If-None-Match': response.headers.etag
			}
		})

		t.fail('Returned full asset instead of 304')
	} catch(err) {
		t.is(err.statusCode, 304)
	}
})
