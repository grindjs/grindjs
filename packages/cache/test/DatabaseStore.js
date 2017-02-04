import test from 'ava'
import { CacheBuilder } from '../src/CacheBuilder'
import { Grind } from './helpers/Grind'

function store() {
	const app = new Grind
	const cache = CacheBuilder('database', app)

	return cache.store.db.schema.createTable('cache', table => {
		table.string('key').unique()
		table.text('value')
		table.datetime('expires_at')
	}).then(() => cache.store.db('cache').insert({
		key: 'test',
		value: JSON.stringify('test'),
		expires_at: new Date(Date.now() + 86400000)
	}, {
		key: 'expired',
		value: JSON.stringify('test'),
		expires_at: new Date(Date.now() - 86400000)
	})).then(() => cache)
}

test('get', t => {
	return store()
	.then(store => store.get('test'))
	.then(value => t.is(value, 'test'))
})

test('get expired', t => {
	return store()
	.then(store => store.get('expired'))
	.then(value => t.is(value, null))
})

test('set', t => {
	return store()
	.then(store => store.set('test2', 'testing').then(() => store))
	.then(store => store.get('test2')).then(value => t.is(value, 'testing'))
})

test('buffer', t => {
	return store()
	.then(store => store.set('buffer', new Buffer('testing')).then(() => store))
	.then(store => store.get('buffer')).then(value => {
		t.is(Buffer.isBuffer(value), true)
		t.is(value.toString(), 'testing')
	})
})

test('object', t => {
	return store()
	.then(store => store.set('object', { a: { b: 'c' } }).then(() => store))
	.then(store => store.get('object')).then(value => t.is(value.a.b, 'c'))
})

test('set expired', t => {
	return store()
	.then(store => store.set('test3', 'testing', { ttl: -1 }).then(() => store))
	.then(store => store.get('test3')).then(value => t.is(value, null))
})

test('delete', t => {
	return store()
	.then(store => store.del('test').then(() => store))
	.then(store => store.get('test'))
	.then(value => t.is(value, null))
})

test('keys', t => {
	return store().then(store => store.keys()).then(keys => {
		t.is(keys.length, 1)
		t.is(keys[0], 'test')
	})
})

test('reset', t => {
	return store()
	.then(store => store.reset().then(() => store))
	.then(store => store.keys())
	.then(keys => t.is(keys.length, 0))
})
