import test from 'ava'

import '../src/Support/buildRedisConfig'
import './helpers/Application'

test.beforeEach(t => {
	t.context.app = new Application
})

test('redis', t => {
	const config = buildRedisConfig(t.context.app, t.context.app.config.get('queue.connections.redis').connection)

	t.is(config.host, 'localhost')
	t.is(config.port, 6379)
	t.is(config.pass, void 0)
})

test('redis-default', t => {
	const config = buildRedisConfig(t.context.app, t.context.app.config.get('queue.connections.redis-default').connection)

	t.is(config.host, 'test')
	t.is(config.port, 6000)
	t.is(config.pass, void 0)
})

test('redis-auth', t => {
	const config = buildRedisConfig(t.context.app, t.context.app.config.get('queue.connections.redis-auth').connection)

	t.is(config.host, 'localhost')
	t.is(config.port, 6379)
	t.is(config.password, 'test')
})
