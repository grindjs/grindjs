import { serial as test } from 'ava'
import './helpers/Application'

function config(env = 'local') {
	return new Application({ env }).config
}

test.beforeEach(() => {
	delete process.env.APP_CONFIG
})

test('simple', t => {
	t.is(config().get('app.debug', false), true)
})

test('simple - func', t => {
	t.is(config().get('app-func.debug', false), true)
})

test('simple - object', t => {
	t.is(config().get('app-func.debug', false), true)
})

test('nesting', t => {
	t.is(config().get('app.nested.c.true', false), true)
})

test('nesting - func', t => {
	t.is(config().get('app-func.nested.c.true', false), true)
})

test('nesting - object', t => {
	t.is(config().get('app-object.nested.c.true', false), true)
})

test('environment cascading', t => {
	t.is(config('production').get('app.debug', true), false)
})

test('environment cascading - func', t => {
	t.is(config('staging').get('app.debug', true), false)
})

test('environment cascading nesting', t => {
	t.is(config('production').get('app.nested.c.true', true), false)
	t.is(config('production').get('app.nested.d.true', false), true)
})

test('environment cascading nesting - func', t => {
	t.is(config('staging').get('app.nested.c.true', true), false)
})

test('.env', t => {
	t.is(config().get('app.port', 0), 3001)
})

test('.env dot notation', t => {
	t.is(config().get('app.public-port', 0), 3002)
})

test('APP_CONFIG', t => {
	process.env.APP_CONFIG = JSON.stringify({
		app: {
			port: 12345,
		},
	})

	t.is(config().get('app.port', 0), 12345)
})

test('APP_CONFIG dot notation', t => {
	process.env.APP_CONFIG = JSON.stringify({
		'app.port': 54321,
	})

	t.is(config().get('app.port', 0), 54321)
})
