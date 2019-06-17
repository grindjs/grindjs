import test from 'ava'
import { merge } from '../src'

const lhs = {
	debug: true,
	nested: {
		a: 'a',
		b: 'b',
		c: {
			true: true
		},
		d: null
	},
	array: [ 'a', 'b' ]
}

const rhs = {
	debug: false,
	nested: {
		c: {
			true: false
		},
		d: {
			true: true
		}
	},
	array: [ 'c' ]
}

test('simple', t => {
	const merged = merge(lhs, rhs)
	t.is(merged.debug, false)
})

test('nested', t => {
	const merged = merge(lhs, rhs)
	t.is(merged.nested.c.true, false)
	t.is(merged.nested.d.true, true)
})

test('arrays', t => {
	const merged = merge(lhs, rhs)
	t.is(merged.array.indexOf('a'), 0)
	t.is(merged.array.indexOf('c'), 2)
})
