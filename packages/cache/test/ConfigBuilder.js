import test from 'ava'
import { ConfigBuilder } from '../src/ConfigBuilder'
import { Grind } from './helpers/Grind'

test('memory', t => {
	const config = ConfigBuilder('memory', new Grind())

	t.is(config.store, null)
	t.is(config.options.max, 10000)
	t.is(config.options.ttl, 86400)
})

test('redis', t => {
	const config = ConfigBuilder('redis', new Grind())

	t.is(config.store, 'cache-manager-redis')
	t.is(config.options.host, 'localhost')
	t.is(config.options.port, 6379)
	t.is(config.options.auth_pass, void 0)
	t.is(config.options.ttl, 86400)
})

test('redis-default', t => {
	const config = ConfigBuilder('redis-default', new Grind())

	t.is(config.store, 'cache-manager-redis')
	t.is(config.options.host, 'test')
	t.is(config.options.port, 6379)
	t.is(config.options.auth_pass, void 0)
	t.is(config.options.ttl, 86400)
})

test('redis-auth', t => {
	const config = ConfigBuilder('redis-auth', new Grind())

	t.is(config.store, 'cache-manager-redis')
	t.is(config.options.host, 'localhost')
	t.is(config.options.auth_pass, 'test')
	t.is(config.options.password, void 0)
	t.is(config.options.ttl, 86400)
})
