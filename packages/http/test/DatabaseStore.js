//
// Adapted from connect-session-knex
// https://github.com/llambda/connect-session-knex/blob/52717c6/test.js
//

import test from 'ava'
import knex from 'knex'

import '../src/Session/DatabaseStore'

import { Log } from 'grind-framework'
global.Log = Log

function makeStore() {
	const db = knex({
		client: 'sqlite3',
		useNullAsDefault: true,
		connection: {
			filename: ':memory:'
		}
	})

	return db.schema.createTable('sessions', table => {
		table.string('id').unique()
		table.text('data')
		table.datetime('expires_at')
	}).then(() => db('sessions').insert({
		id: '1111222233334444',
		data: JSON.stringify({
			name: 'sample name',
			cookie: {
				maxAge: 20000
			}
		}),
		expires_at: new Date(Date.now() + 3600000)
	})).then(() => new DatabaseStore({ connection: db }))
}

test('initial clear', function*(t) {
	const store = yield makeStore()

	t.is(yield store.clear(), 1)
	t.is(yield store.length(), 0)
})

test('set then clear', function*(t) {
	const store = yield makeStore()

	yield store.set('1092348234', {
		name: 'InsertThenClear',
		cookie: {
			maxAge: 1000
		}
	})

	t.is(yield store.clear(), 2)
	t.is(yield store.length(), 0)
})

test('double clear', function*(t) {
	const store = yield makeStore()

	yield store.clear()
	t.is(yield store.clear(), 0)
	t.is(yield store.length(), 0)
})

test('destroy', function*(t) {
	const store = yield makeStore()

	yield store.set('555666777', {
		name: 'Rob Dobilina',
		cookie: {
			maxAge: 1000
		}
	})
	t.is(yield store.length(), 2)
	t.is(yield store.destroy('555666777'), 1)

	t.is(yield store.length(), 1)
})

test('set', function*(t) {
	const store = yield makeStore()

	yield store.set('1111222233334444', {
		name: 'sample name',
		cookie: {
			maxAge: 20000
		}
	})

	t.is(yield store.length(), 1)
})

test('retrieve', function*(t) {
	const store = yield makeStore()

	t.deepEqual(yield store.get('1111222233334444'), {
		name: 'sample name',
		cookie: {
			maxAge: 20000
		}
	})
})

test('unknown session', function*(t) {
	const store = yield makeStore()

	t.is(yield store.get('hope-and-change'), null)
})

test('only one session should exist', function*(t) {
	const store = yield makeStore()

	t.is(yield store.length(), 1)
})

test('touch', function*(t) {
	const store = yield makeStore()

	yield store.clear()
	yield store.set('11112222333344445555', {
		name: 'sample name',
		cookie: {
			maxAge: 20000
		}
	})

	yield store.touch('11112222333344445555', {
		name: 'sample name',
		cookie: {
			maxAge: 20000,
			expires: new Date
		}
	})

	t.is(yield store.length(), 1)
})

test('clear expired sessions', function*(t) {
	const store = yield makeStore()

	yield store.set('11112222333344445555', {
		name: 'sample name',
		cookie: {
			expires: new Date(Date.now() - 3600000)
		}
	})

	t.is(yield store.length(), 2)
	t.is(yield store.clearExpiredSessions(), 1)
	t.is(yield store.length(), 1)
})

test('expired sessions at interval', function*(t) {
	const store = yield makeStore()

	yield store.set('11112222333344445555', {
		name: 'sample name',
		cookie: {
			expires: new Date(Date.now() - 3600000)
		}
	})

	store.setExpirationInterval(100)

	t.is(yield store.length(), 2)
	yield new Promise(resolve => setTimeout(resolve, 110))
	t.is(yield store.length(), 1)

	store.clearExpirationInterval()
})
