import test from 'ava'
import { Obj } from '../src'

test('Obj.get', t => {
	t.is(Obj.get({
		app: {
			debug: true
		}
	}, 'app.debug', false), true)
})

test('Obj.get falsey', t => {
	t.is(Obj.get({
		app: {
			debug: false
		}
	}, 'app.debug', true), false)
})

test('Obj.get fallback', t => {
	t.is(Obj.get({ }, 'app.debug', true), true)
})

test('Obj.has', t => {
	t.is(Obj.has({
		app: {
			debug: true
		}
	}, 'app.debug'), true)
})

test('!Obj.has', t => {
	t.is(Obj.has({
		app: { }
	}, 'app.debug'), false)
})

test('Obj.set', t => {
	const obj = { app: { } }
	Obj.set(obj, 'app.debug', true)

	t.is(obj.app.debug, true)
})

test('Obj.delete', t => {
	const obj = { app: { debug: true } }
	Obj.delete(obj, 'app.debug')

	t.false('debug' in obj.app)
	t.deepEqual({ app: { } }, obj)
})

test('Obj.delete non-existent path', t => {
	const obj = { }
	Obj.delete(obj, 'app.debug')

	t.deepEqual({ }, obj)
})

test('Obj.filter', t => {
	const obj = { a: 'a', b: 'b', c: 'c' }
	const filtered = { a: 'a', c: 'c' }

	t.deepEqual(Obj.filter(obj, key => key === 'a' || key === 'c'), filtered)
	t.deepEqual(Obj.filter(obj, (_, value) => value === 'a' || value === 'c'), filtered)
	t.deepEqual(Obj.filter(obj, key => key === 'd'), { })
})

test('Obj.only', t => {
	const obj = { a: 'a', b: 'b', c: 'c' }
	const only = { b: 'b', c: 'c' }

	t.deepEqual(Obj.only(obj, [ 'b', 'c' ]), only)
	t.deepEqual(Obj.only(obj, [ 'd' ]), { })
})

test('Obj.except', t => {
	const obj = { a: 'a', b: 'b', c: 'c' }
	const except = { b: 'b', c: 'c' }

	t.deepEqual(Obj.except(obj, [ 'a' ]), except)
	t.deepEqual(Obj.except(obj, [ 'd' ]), obj)
})
