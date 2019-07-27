/* eslint-disable max-len */
import test from 'ava'

import './helpers/compile'
import './helpers/postProcess'

import {
	BabelCompiler,
	RawCompiler,
	ScssCompiler,

	CssPostCssPostProcessor,
	JavascriptMinifyPostProcessor,
	SvgOptimizePostProcessor
} from '../src'

const stripAnsi = require('strip-ansi')

test('scss', async t => {
	try {
		await compile(ScssCompiler, 'scss/error.scss')
		t.fail('Should have thrown error')
	} catch(err) {
		t.is('SyntaxError', err.name)
		t.deepEqual([
			'./resources/assets/scss/error.scss',
			'Line 2: property "back" must be followed by a \':\'',
			'',
			'  1 | body {',
			'> 2 | 	back',
			'    | 	^',
			'  3 | 	ground: white;',
			'  4 | }',
			'  5 |'
		], prepareErrorMessage(err))
	}
})

test('css/postcsss', async t => {
	try {
		const contents = await compile(RawCompiler, 'css/error.css')
		await postProcess(CssPostCssPostProcessor, 'css/error.css', contents)
		t.fail('Should have thrown error')
	} catch(err) {
		t.is('SyntaxError', err.name)
		t.deepEqual([
			'./resources/assets/css/error.css',
			'Line 2: Unclosed bracket',
			'',
			'  1 | body {',
			'> 2 | 	color: rgba(',
			'    | 	           ^',
			'  3 | }',
			'  4 |'
		], prepareErrorMessage(err))
	}
})

test('babel', async t => {
	try {
		await compile(BabelCompiler, 'babel/errors/simple.js')
		t.fail('Should have thrown error')
	} catch(err) {
		t.is('SyntaxError', err.name)
		t.deepEqual([
			'./resources/assets/babel/errors/simple.js',
			'Line 3: Unexpected token, expected "," (3:15)',
			'',
			'  1 | const object = {',
			'  2 | 	a: \'grind\',',
			'> 3 | 	b: \'framework\';',
			'    | 	             ^',
			'  4 | }',
			'  5 |',
		], prepareErrorMessage(err))
	}
})

test('babel/import', async t => {
	try {
		await compile(BabelCompiler, 'babel/errors/imported.js')
		t.fail('Should have thrown error')
	} catch(err) {
		t.is('SyntaxError', err.name)
		t.deepEqual([
			'./resources/assets/babel/errors/import.js',
			'Line 3: Unexpected token, expected "," (3:15)',
			'',
			'  1 | export const something = {',
			'  2 | 	a: \'grind\',',
			'> 3 | 	b: \'framework\';',
			'    | 	             ^',
			'  4 | }',
			'  5 |',
		], prepareErrorMessage(err))
	}
})

test('rollup', async t => {
	try {
		await compile(BabelCompiler, 'babel/rollup/errors/simple.js', app => {
			app.config.set('assets.compilers.babel.rollup.enabled', true)
			app.config.set('assets.compilers.babel.browserify.enabled', false)
		})
		t.fail('Should have thrown error')
	} catch(err) {
		t.is('SyntaxError', err.name)
		t.deepEqual([
			'./resources/assets/babel/rollup/errors/simple.js',
			'Line 3: Unexpected token, expected "," (3:15)',
			'',
			'  1 | const object = {',
			'  2 | 	a: \'grind\',',
			'> 3 | 	b: \'framework\';',
			'    | 	             ^',
			'  4 | }',
			'  5 |',
		], prepareErrorMessage(err))
	}
})

test('rollup/import', async t => {
	try {
		await compile(BabelCompiler, 'babel/rollup/errors/imported.js', app => {
			app.config.set('assets.compilers.babel.rollup.enabled', true)
			app.config.set('assets.compilers.babel.browserify.enabled', false)
		})
		t.fail('Should have thrown error')
	} catch(err) {
		t.is('SyntaxError', err.name)
		t.deepEqual([
			'./resources/assets/babel/rollup/errors/import.js',
			'Line 3: Unexpected token, expected "," (3:15)',
			'',
			'  1 | export const something = {',
			'  2 | 	a: \'grind\',',
			'> 3 | 	b: \'framework\';',
			'    | 	             ^',
			'  4 | }',
			'  5 |',
		], prepareErrorMessage(err))
	}
})

test('js/minify', async t => {
	try {
		const contents = await compile(RawCompiler, 'js/error.js')
		await postProcess(JavascriptMinifyPostProcessor, 'js/error.js', contents)
		t.fail('Should have thrown error')
	} catch(err) {
		t.is('SyntaxError', err.name)
		t.deepEqual([
			'./resources/assets/js/error.js',
			'Line 3: Unexpected token: punc «;», expected: punc «,»',
			'',
			'  1 | var object = {',
			'  2 | 	a: \'grind\',',
			'> 3 | 	b: \'framework\';',
			'    | 	             ^',
			'  4 | }',
			'  5 |'
		], prepareErrorMessage(err))
	}
})

test('svg/optimize', async t => {
	try {
		const contents = await compile(RawCompiler, 'img/error.svg')
		await postProcess(SvgOptimizePostProcessor, 'img/error.svg', contents)
		t.fail('Should have thrown error')
	} catch(err) {
		t.is('SyntaxError', err.name)
		t.deepEqual([
			'./resources/assets/img/error.svg',
			'Line 2: Error in parsing SVG: Attribute without value',
			'',
			'  1 | <?xml version="1.0" encoding="UTF-8"?>',
			'> 2 | <sv g>error<',
			'    |      ^',
			'  3 | 	/svg>',
			'  4 |'
		], prepareErrorMessage(err))
	}
})

function prepareErrorMessage(error) {
	return stripAnsi(error.message).trim().split(/\n/)
}
