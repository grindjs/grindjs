import 'babel-polyfill'
import path from 'path'
import { serial as test } from 'ava'

import { FS } from 'grind-support'
import { makeApp as baseMakeApp } from './fixtures/makeApp'

const compiledPath = path.join(__dirname, 'fixtures/storage/views/compiled.js')

function makeApp() {
	return baseMakeApp(app => {
		app.config.set('view.path', '../views/output')
		app.config.set('view.ignore-compiled', false)
	})
}

function clearCache() {
	return FS.unlink(compiledPath).catch(() => { })
}

test('write-cache', async t => {
	await clearCache()
	const app = await makeApp()
	await app.view.engine.writeCache()
	t.pass()
})

test('read-cache', async t => {
	const app = await makeApp()
	t.is(await app.view.engine.cacheManager.exists(), true)
	t.is(
		typeof app.view.engine.compiler.compiled[path.join(app.view.viewPath, 'simple.stone')],
		'function'
	)
})

test('test-cache', async t => {
	const localCompiledPath = path.join(path.dirname(compiledPath), 'compiled-test.js')
	await FS.writeFile(localCompiledPath, `
module.exports.cache = {
	'test-cache.stone': function template(_) {
		return \`Hello \${_.escape(_.title)}!\`;
	}
}`)

	const app = await makeApp()
	app.view.engine.compiler.compiled = { }
	app.view.engine.cacheManager.compiledViewPath = localCompiledPath
	t.is(await app.view.engine.cacheManager.exists(), true)
	await app.view.engine.cacheManager.load()

	t.is(
		(await app.view.render('test-cache', app.config.get('view.data'))),
		'Hello Grind!'
	)

	await FS.unlink(localCompiledPath)
})

test('clear-cache', async t => {
	await clearCache()
	const app = await makeApp()
	t.is(await app.view.engine.cacheManager.exists(), false)
	await app.view.engine.writeCache()
	t.is(await app.view.engine.cacheManager.exists(), true)
	await app.view.engine.clearCache()
	t.is(await app.view.engine.cacheManager.exists(), false)
})

test.after('clean-up', clearCache)
