import test from 'ava'
import { expandDriverAlias } from '../src/Config'

test('memcache', t => {
	t.is(expandDriverAlias('MeMcaChe'), 'cache-manager-memcached-store')
	t.is(expandDriverAlias('memcached'), 'cache-manager-memcached-store')
})

test('redis', t => {
	t.is(expandDriverAlias('redis'), 'cache-manager-redis')
})

test('mongo', t => {
	t.is(expandDriverAlias('mongo'), 'cache-manager-mongodb')
	t.is(expandDriverAlias('mongodb'), 'cache-manager-mongodb')
})

test('mongoose', t => {
	t.is(expandDriverAlias('mongoose'), 'cache-manager-mongoose')
})

test('fs', t => {
	t.is(expandDriverAlias('fs'), 'cache-manager-fs')
	t.is(expandDriverAlias('FS'), 'cache-manager-fs')
	t.is(expandDriverAlias('file'), 'cache-manager-fs')
	t.is(expandDriverAlias('files'), 'cache-manager-fs')
	t.is(expandDriverAlias('filesystem'), 'cache-manager-fs')
})

test('fs-binary', t => {
	t.is(expandDriverAlias('fs-binary'), 'cache-manager-fs-binary')
})

test('memory', t => {
	t.is(expandDriverAlias('mem'), null)
	t.is(expandDriverAlias('memory'), null)
	t.is(expandDriverAlias('in-memory'), null)
	t.is(expandDriverAlias('lru'), null)
})

test('unknown', t => {
	t.is(expandDriverAlias('unknown'), 'unknown')
})
