/* eslint-disable max-len */
import test from 'ava'
import './helpers/Grind'

import { AssetFactory, BabelCompiler, RawCompiler, ScssCompiler } from '../src'

function make() {
	const app = new Grind
	app.config.loadDefault('assets', app.paths.base('../../config/assets.json'))

	const factory = new AssetFactory(app)
	factory.registerCompiler(BabelCompiler)
	factory.registerCompiler(RawCompiler)
	factory.registerCompiler(ScssCompiler)

	return factory
}

test('normalizePath', t => {
	const factory = make()

	t.is(factory.normalizePath('scss/test.scss'), 'scss/test.scss')
	t.is(factory.normalizePath('assets/scss/test.scss'), 'scss/test.scss')
	t.is(factory.normalizePath('/assets/scss/test.scss'), 'scss/test.scss')
	t.is(factory.normalizePath('/scss/test.scss'), 'scss/test.scss')
})

test('publishedPath', t => {
	const factory = make()
	const publishedPath = 'https://assets.cdn/css/test-hash.css'

	t.is(factory.publishedPath('scss/test.scss'), '/assets/scss/test.scss')
	t.is(factory.publishedPath('assets/scss/test.scss'), '/assets/scss/test.scss')
	t.is(factory.publishedPath('/scss/test.scss'), '/assets/scss/test.scss')

	factory.published = {
		'scss/test.scss': publishedPath
	}

	t.is(factory.publishedPath('scss/test.scss'), publishedPath)
	t.is(factory.publishedPath('assets/scss/test.scss'), publishedPath)
	t.is(factory.publishedPath('/scss/test.scss'), publishedPath)
	t.is(factory.publishedPath('/scss/other.scss'), '/assets/scss/other.scss')
})
