import test from 'ava'
import '../src/Obj'

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
