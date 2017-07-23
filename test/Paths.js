import test from 'ava'
import { Paths } from '../src'

const path = require('path')

test('findBase', async t => {
	const paths = new Paths('/')
	t.is(paths.findBase(), path.dirname(__dirname))
})
