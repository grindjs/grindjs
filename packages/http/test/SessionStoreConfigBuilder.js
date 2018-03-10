import test from 'ava'
import '../src/Session/StoreConfigBuilder'
import '../src/HttpKernel'
import './helpers/Application'

test('memory', t => {
	const config = StoreConfigBuilder('memory', new Application(HttpKernel), true)

	t.is(config.store, 'memory')
})

test('redis', t => {
	const config = StoreConfigBuilder('redis', new Application(HttpKernel), true)

	t.is(config.store, 'connect-redis')
	t.is(config.options.host, 'localhost')
	t.is(config.options.port, 6379)
	t.is(config.options.pass, void 0)
})

test('redis-default', t => {
	const config = StoreConfigBuilder('redis-default', new Application(HttpKernel), true)

	t.is(config.store, 'connect-redis')
	t.is(config.options.host, 'test')
	t.is(config.options.port, 6379)
	t.is(config.options.pass, void 0)
})

test('redis-auth', t => {
	const config = StoreConfigBuilder('redis-auth', new Application(HttpKernel), true)

	t.is(config.store, 'connect-redis')
	t.is(config.options.host, 'localhost')
	t.is(config.options.port, 6379)
	t.is(config.options.pass, 'test')
})

test('database', t => {
	const config = StoreConfigBuilder('database', new Application(HttpKernel), true)
	const connection = config.options.connection.client.config

	t.is(config.store, 'database')
	t.is(typeof config.options.connection, 'function')
	t.is(connection.connection.filename, ':memory:')
})

test('database-default', t => {
	const app = new Application(HttpKernel)
	app.providers.add(require('grind-db').DatabaseProvider)

	return app.boot().then(() => {
		const config = StoreConfigBuilder('database-default', app, true)
		const connection = config.options.connection.client.config

		t.is(config.store, 'database')
		t.is(typeof config.options.connection, 'function')
		t.is(connection.connection.filename, './database/database.sqlite')
	})
})

test('database-alt', t => {
	const config = StoreConfigBuilder('database-alt', new Application(HttpKernel), true)
	const connection = config.options.connection.client.config

	t.is(config.store, 'database')
	t.is(typeof config.options.connection, 'function')
	t.is(connection.connection.filename, './database/database-alt.sqlite')
})
