import test from 'ava'
import '../src/ConfigBuilder'
import './helpers/Grind'

test('redis', t => {
	const config = ConfigBuilder('redis', new Grind)

	t.is(config.redis.host, 'localhost')
	t.is(config.redis.port, 6379)
	t.is(config.redis.auth, void 0)
})

test('redis-default', t => {
	const config = ConfigBuilder('redis-default', new Grind)

	t.is(config.redis.host, 'test')
	t.is(config.redis.port, 6379)
	t.is(config.redis.auth, void 0)
})

test('redis-auth', t => {
	const config = ConfigBuilder('redis-auth', new Grind)

	t.is(config.redis.host, 'localhost')
	t.is(config.redis.port, 6379)
	t.is(config.redis.auth, 'test')
})
