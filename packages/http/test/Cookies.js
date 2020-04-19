import test from 'ava'
import './helpers/request'

function get(path, options) {
	return request(
		-5,
		app => {
			app.routes.get('/read', (req, res) => {
				res.send(req.cookies)
			})

			app.routes.get('/write', (req, res) => {
				res.cookie('test', 'test')
				res.send('1')
			})
		},
		path,
		options,
	)
}

test('read', t => {
	return get('read', {
		headers: {
			Cookie: 'test=test',
		},
		json: true,
	}).then(response => {
		t.deepEqual(response.body, { test: 'test' })
	})
})

test('write', t => {
	return get('write').then(response => {
		t.is(response.headers['set-cookie'].toString().substring(0, 9), 'test=test')
	})
})
