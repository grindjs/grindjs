import test from 'ava'
import request from 'request-promise-native'

import './helpers/Grind'
import '../src/HttpServer'

let port = 0
function get(path) {
	let app = null

	return (new HttpServer(() => {
		app = new Grind({
			port: 32200 + (++port)
		})

		const handler = (req, res) => res.send(req.path)

		app.routes.get('none', handler)

		app.routes.use((req, res, next) => {
			res.set('X-Middleware-A', 'true')
			next()
		})

		app.routes.get('global', handler)

		app.routes.group(routes => {
			routes.use((req, res, next) => {
				res.set('X-Middleware-B', 'true')
				next()
			})

			routes.get('group', handler)

			routes.bind('segment', value => Promise.resolve(`${value}-true`))
			routes.get('group/:segment', (req, res) => res.send(req.params.segment))

			app.routes.group(routes => {
				routes.use((req, res, next) => {
					res.set('X-Middleware-C', 'true')
					next()
				})

				routes.get('cascading', handler)
			})

			routes.get('cascading-scoped', handler)
		})

		app.routes.get('scoping', handler)

		return app
	})).start().then(() => request({
		uri: `http://127.0.0.1:${app.port}/${path}`,
		resolveWithFullResponse: true
	})).then(response => {
		return app.shutdown().then(() => response)
	}).catch(err => {
		return app.shutdown().then(() => { throw err })
	})
}

test('none', t => {
	return get('none').then(response => {
		t.is(response.headers['x-middleware-a'], void 0)
		t.is(response.headers['x-middleware-b'], void 0)
	})
})

test('global', t => {
	return get('global').then(response => {
		t.is(response.headers['x-middleware-a'], 'true')
	})
})

test('group', t => {
	return get('group').then(response => {
		t.is(response.headers['x-middleware-a'], 'true')
		t.is(response.headers['x-middleware-b'], 'true')
	})
})

test('group segment', t => {
	return get('group/123').then(response => {
		t.is(response.body.toString().trim(), '123-true')
	})
})

test('cascading', t => {
	return Promise.all([
		get('cascading'),
		get('cascading-scoped')
	]).then(responses => {
		t.is(responses[0].headers['x-middleware-a'], 'true')
		t.is(responses[1].headers['x-middleware-a'], 'true')

		t.is(responses[0].headers['x-middleware-b'], 'true')
		t.is(responses[1].headers['x-middleware-b'], 'true')

		t.is(responses[0].headers['x-middleware-c'], 'true')
		t.is(responses[1].headers['x-middleware-c'], void 0)
	})
})

test('scoping', t => {
	return get('scoping').then(response => {
		t.is(response.headers['x-middleware-a'], 'true')
		t.is(response.headers['x-middleware-b'], void 0)
		t.is(response.headers['x-middleware-c'], void 0)
	})
})
