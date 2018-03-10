import test from 'ava'
import './helpers/Application'
import '../src/HttpKernel'

function url() {
	const app = new Application(HttpKernel, { port: 80 })
	const handler = (req, res) => res.send(req.path)

	app.routes.get('users', handler).as('users.index')
	app.routes.get('users/:id', handler).as('users.show')
	app.routes.get('users/:id/:section?', handler).as('users.section')

	return app.url
}

test('hash', t => {
	t.is(url().make('#'), 'http://localhost/#')
	t.is(url().make('#hash'), 'http://localhost/#hash')
	t.is(url().make('#hash', { }, true), 'https://localhost/#hash')
})

test('empty', t => {
	t.is(url().make(''), 'http://localhost/')
})

test('absolute', t => {
	t.is(url().make('http://grind.rocks/'), 'http://grind.rocks/')
})

test('path', t => {
	t.is(url().make('edit'), 'http://localhost/edit')
	t.is(url().make('edit', { }, true), 'https://localhost/edit')
})

test('named', t => {
	t.is(url().route('users.index'), 'http://localhost/users')
	t.is(url().route('users.show', 1), 'http://localhost/users/1')
	t.is(url().route('users.show', [ 1 ]), 'http://localhost/users/1')
	t.is(url().route('users.show', { id: 1 }), 'http://localhost/users/1')
	t.is(url().route('users.show', { id: 1 }, true), 'https://localhost/users/1')
})

test('parameters', t => {
	t.is(url().make('/', { filter: 'all' }), 'http://localhost/?filter=all')
	t.is(url().make('/?filter=none', { filter: 'all' }), 'http://localhost/?filter=all')
	t.is(url().make('/?sort=asc', { filter: 'all' }), 'http://localhost/?sort=asc&filter=all')
	t.is(url().make('/?sort=asc', { filter: 'all' }, true), 'https://localhost/?sort=asc&filter=all')

	t.is(url().route('users.index', { filter: 'all' }), 'http://localhost/users?filter=all')
	t.is(url().route('users.show', { id: 1, filter: 'all' }), 'http://localhost/users/1?filter=all')
	t.is(url().route('users.show', { id: 1, filter: 'all' }, true), 'https://localhost/users/1?filter=all')
})

test('optional', t => {
	t.is(url().route('users.section', { id: 1 }), 'http://localhost/users/1')
	t.is(url().route('users.section', { id: 1, section: 'all' }), 'http://localhost/users/1/all')
})
