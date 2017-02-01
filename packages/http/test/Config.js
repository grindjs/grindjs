import test from 'ava'

import './helpers/Grind'

function config(env = 'local') {
	return (new Grind({ env })).config
}

test('simple', t => {
	t.is(config().get('app.debug', false), true)
})

test('nesting', t => {
	t.is(config().get('app.nested.c.true', false), true)
})

test('environment cascading', t => {
	t.is(config('production').get('app.debug', true), false)
})

test('environment cascading nesting', t => {
	t.is(config('production').get('app.nested.c.true', true), false)
})

test('.env', t => {
	t.is(config().get('app.port', 0), 3001)
})
