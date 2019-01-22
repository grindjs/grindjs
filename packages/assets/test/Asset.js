/* eslint-disable max-len */
import test from 'ava'
import './helpers/Grind'

import { AssetFactory, BabelCompiler, RawCompiler, ScssCompiler } from '../src'

function make(file) {
	const app = new Grind
	app.config.loadDefault('assets', app.paths.base('../../config/assets.json'))

	const factory = new AssetFactory(app)
	factory.registerCompiler(BabelCompiler)
	factory.registerCompiler(RawCompiler)
	factory.registerCompiler(ScssCompiler)

	return factory.make(app.paths.base('resources/assets', file))
}

test('kind', t => {
	t.is(make('scss/test.scss').kind, 'style')
	t.is(make('babel/test.js').kind, 'script')
	t.is(make('img/test.svg').kind, 'raw')
	t.is(make('js/test.js').kind, 'raw')
	t.is(make('css/test.css').kind, 'raw')
})

test('kindPriority', t => {
	t.true(make('scss/test.scss').kindPriority > make('babel/test.js').kindPriority)
	t.true(make('css/test.css').kindPriority > make('babel/test.js').kindPriority)
	t.true(make('css/test.css').kindPriority > make('scss/test.scss').kindPriority)
	t.true(make('img/test.svg').kindPriority === make('css/test.css').kindPriority)
})

test('compareKind', t => {
	t.true(make('scss/test.scss').compareKind(make('babel/test.js')) > 0)
	t.true(make('img/test.svg').compareKind(make('babel/test.js')) > 0)
	t.true(make('css/test.css').compareKind(make('babel/test.js')) > 0)
	t.true(make('js/test.js').compareKind(make('babel/test.js')) > 0)

	t.false(make('scss/test.scss').compareKind(make('css/test.css')) > 0)
	t.true(make('css/test.css').compareKind(make('css/test-all.css')) > 0)
})
