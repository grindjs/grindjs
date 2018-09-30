import test from 'ava'
import './fixtures/makeApp'

const path = require('path')

test('namespace', async t => {
	const app = await makeApp()
	const { engine } = app.view
	engine.namespace('abc', path.join(__dirname, 'views/output'))

	t.is(engine.resolve('abc::at'), path.join(__dirname, 'views/output/at.stone'))
	t.is(engine.resolve('output.at'), path.join(__dirname, 'views/output/at.stone'))

	try {
		engine.resolve('null::at')
		t.fail('Error should have been thrown')
	} catch(err) {
		t.is(err.message, 'Invalid namespace: null')
	}
})

test('resolve', async t => {
	const app = await makeApp()
	const { engine } = app.view
	t.is(engine.resolve('output.at'), path.join(__dirname, 'views/output/at.stone'))
})
