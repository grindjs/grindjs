import test from 'ava'
import { ConfigBuilder } from '../src/ConfigBuilder'
import { Grind } from './helpers/Grind'

test('memory', t => {
	const config = ConfigBuilder('memory', new Grind, true)

	t.is(config.store, null)
	t.is(config.options.max, 10000)
	t.is(config.options.ttl, 86400)
})

test('redis', t => {
	const config = ConfigBuilder('redis', new Grind, true)

	t.is(config.store, 'cache-manager-redis')
	t.is(config.host, 'localhost')
	t.is(config.port, 6379)
	t.is(config.auth_pass, void 0)
	t.is(config.ttl, 86400)
})

test('redis-default', t => {
	const config = ConfigBuilder('redis-default', new Grind, true)

	t.is(config.store, 'cache-manager-redis')
	t.is(config.host, 'test')
	t.is(config.port, 6379)
	t.is(config.auth_pass, void 0)
	t.is(config.ttl, 86400)
})

test('redis-auth', t => {
	const config = ConfigBuilder('redis-auth', new Grind, true)

	t.is(config.store, 'cache-manager-redis')
	t.is(config.host, 'localhost')
	t.is(config.auth_pass, 'test')
	t.is(config.password, void 0)
	t.is(config.ttl, 86400)
})

test('database', t => {
	const config = ConfigBuilder('database', new Grind, true)
	const connection = config.options.connection.client.config

	t.is(config.store, 'database')
	t.is(typeof config.options.connection, 'function')
	t.is(connection.connection.filename, ':memory:')
	t.is(config.options.ttl, 86400)
})

test('database-default', t => {
	const app = new Grind
	app.providers.add(require('grind-db').DatabaseProvider)

	return app.boot().then(() => {
		const config = ConfigBuilder('database-default', app, true)
		const connection = config.options.connection.client.config

		t.is(config.store, 'database')
		t.is(typeof config.options.connection, 'function')
		t.is(connection.connection.filename, './database/database.sqlite')
		t.is(config.options.ttl, 86400)
	})
})

test('database-alt', t => {
	const config = ConfigBuilder('database-alt', new Grind, true)
	const connection = config.options.connection.client.config

	t.is(config.store, 'database')
	t.is(typeof config.options.connection, 'function')
	t.is(connection.connection.filename, './database/database-alt.sqlite')
	t.is(config.options.ttl, 86400)
})
