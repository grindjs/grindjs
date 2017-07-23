import test from 'ava'
import { FS } from '../src'

const path = require('path')
const fixtures = path.join(__dirname, 'fixtures/fs')

test('read-file', async t => {
	t.is((await FS.readFile(path.join(fixtures, 'test.txt'))).toString().trim(), 'grind')
})

test('write-file', async t => {
	const contents = Date.now().toString()
	const pathname = path.join(fixtures, 'test-write.txt')
	await FS.writeFile(pathname, contents)
	t.is((await FS.readFile(pathname)).toString().trim(), contents)
})

test('mkdirs', async t => {
	await FS.mkdirs(path.join(fixtures, `nested/${Date.now()}/a/b/c`))
	t.pass()
})

test('exists', async t => {
	t.is(await FS.exists(path.join(fixtures, 'test.txt')), true)
})
