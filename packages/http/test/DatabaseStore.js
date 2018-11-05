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

test('initial clear', async t => {
	const store = await makeStore()

	t.is(await store.clear(), 1)
	t.is(await store.length(), 0)
})

test('set then clear', async t => {
	const store = await makeStore()

	await store.set('1092348234', {
		name: 'InsertThenClear',
		cookie: {
			maxAge: 1000
		}
	})

	t.is(await store.clear(), 2)
	t.is(await store.length(), 0)
})

test('double clear', async t => {
	const store = await makeStore()

	await store.clear()
	t.is(await store.clear(), 0)
	t.is(await store.length(), 0)
})

test('destroy', async t => {
	const store = await makeStore()

	await store.set('555666777', {
		name: 'Rob Dobilina',
		cookie: {
			maxAge: 1000
		}
	})
	t.is(await store.length(), 2)
	t.is(await store.destroy('555666777'), 1)

	t.is(await store.length(), 1)
})

test('set', async t => {
	const store = await makeStore()

	await store.set('1111222233334444', {
		name: 'sample name',
		cookie: {
			maxAge: 20000
		}
	})

	t.is(await store.length(), 1)
})

test('retrieve', async t => {
	const store = await makeStore()

	t.deepEqual(await store.get('1111222233334444'), {
		name: 'sample name',
		cookie: {
			maxAge: 20000
		}
	})
})

test('unknown session', async t => {
	const store = await makeStore()

	t.is(await store.get('hope-and-change'), null)
})

test('only one session should exist', async t => {
	const store = await makeStore()

	t.is(await store.length(), 1)
})

test('touch', async t => {
	const store = await makeStore()

	await store.clear()
	await store.set('11112222333344445555', {
		name: 'sample name',
		cookie: {
			maxAge: 20000
		}
	})

	await store.touch('11112222333344445555', {
		name: 'sample name',
		cookie: {
			maxAge: 20000,
			expires: new Date
		}
	})

	t.is(await store.length(), 1)
})

test('clear expired sessions', async t => {
	const store = await makeStore()

	await store.set('11112222333344445555', {
		name: 'sample name',
		cookie: {
			expires: new Date(Date.now() - 3600000)
		}
	})

	t.is(await store.length(), 2)
	t.is(await store.clearExpiredSessions(), 1)
	t.is(await store.length(), 1)
})

test('expired sessions at interval', async t => {
	const store = await makeStore()

	await store.set('11112222333344445555', {
		name: 'sample name',
		cookie: {
			expires: new Date(Date.now() - 3600000)
		}
	})

	store.setExpirationInterval(100)

	t.is(await store.length(), 2)
	await new Promise(resolve => setTimeout(resolve, 110))
	t.is(await store.length(), 1)

	store.clearExpirationInterval()
})
