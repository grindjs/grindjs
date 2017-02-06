import test from 'ava'
import { StoreConfigBuilder } from '../src/Session/StoreConfigBuilder'
import { Grind } from './helpers/Grind'

test('memory', t => {
	const config = StoreConfigBuilder('memory', new Grind, true)

	t.is(config.store, 'memory')
})

test('redis', t => {
	const config = StoreConfigBuilder('redis', new Grind, true)

	t.is(config.store, 'connect-redis')
	t.is(config.options.host, 'localhost')
	t.is(config.options.port, 6379)
	t.is(config.options.pass, void 0)
})

test('redis-default', t => {
	const config = StoreConfigBuilder('redis-default', new Grind, true)

	t.is(config.store, 'connect-redis')
	t.is(config.options.host, 'test')
	t.is(config.options.port, 6379)
	t.is(config.options.pass, void 0)
})

test('redis-auth', t => {
	const config = StoreConfigBuilder('redis-auth', new Grind, true)

	t.is(config.store, 'connect-redis')
	t.is(config.options.host, 'localhost')
	t.is(config.options.port, 6379)
	t.is(config.options.pass, 'test')
})

test('database', t => {
	const config = StoreConfigBuilder('database', new Grind, true)
	const connection = config.options.connection.client.config

	t.is(config.store, 'database')
	t.is(typeof config.options.connection, 'function')
	t.is(connection.connection.filename, ':memory:')
})

test('database-default', t => {
	const app = new Grind
	app.providers.push(require('grind-db').DatabaseProvider)

	return app.boot().then(() => {
		const config = StoreConfigBuilder('database-default', app, true)
		const connection = config.options.connection.client.config

		t.is(config.store, 'database')
		t.is(typeof config.options.connection, 'function')
		t.is(connection.connection.filename, './database/database.sqlite')
	})
})

test('database-alt', t => {
	const config = StoreConfigBuilder('database-alt', new Grind, true)
	const connection = config.options.connection.client.config

	t.is(config.store, 'database')
	t.is(typeof config.options.connection, 'function')
	t.is(connection.connection.filename, './database/database-alt.sqlite')
})
