import test from 'ava'
import { makeServer } from './helpers/request'

function server(connection) {
	const boot = app => {
		app.routes.post('set', (req, res) => {
			req.session.values = { ...req.body }
			res.send('done')
		})

		app.routes.get('get', (req, res) => res.send(req.session.values))
	}

	if(connection !== void 0) {
		boot.before = app => {
			app.config.set('session.default', connection)
		}
	}

	return makeServer(30, boot)
}

function performTest(connection, callback) {
	return async t => {
		const s = await server(connection)

		if(!callback.isNil) {
			await callback(s)
		}

		try {
			const payload = {
				number: 1,
				letter: 'a',
				boolean: true
			}

			await s.request('set', {
				json: true,
				method: 'post',
				body: payload,
				jar: true
			})

			const response = await s.request('get', {
				json: true,
				jar: true
			})

			t.deepEqual(response.body, payload)
		} catch(err) {
			throw err
		} finally {
			await s.shutdown()
		}
	}
}

test('memory', performTest())
test('database', performTest('database', app => {
	return app.routes.middleware.session.__store.db.schema.createTable('sessions', table => {
		table.string('id').unique()
		table.text('data')
		table.datetime('expires_at')
	})
}))
