import test from 'ava'
import { makeServer } from './helpers/request'

function server(connection) {
	const boot = app => {
		app.routes.post('set', (req, res) => {
			req.session.values = { ...req.body }
			res.send('done')
		})

		app.routes.get('get', (req, res) => res.send(req.session.values))

		app.routes.post('flash', (req, res) => {
			req.flash('values', { ...req.body })
			res.send('done')
		})

		app.routes.get('flash', (req, res) => res.send(req.flash('values')))

		app.routes.post('old-input', (req, res) => {
			req.flashInput()
			res.send('done')
		})

		app.routes.get('old-input', (req, res) => res.send(req.flash('_old_input')[0]))
	}

	if (connection !== void 0) {
		boot.before = app => {
			app.config.set('session.default', connection)
		}
	}

	return makeServer(30, boot)
}

function makeTest(connection, builder, callback) {
	return async t => {
		const s = await server(connection)

		if (!callback.isNil) {
			await callback(s)
		}

		try {
			await builder(t, s)
		} catch (err) {
			throw err
		} finally {
			await s.shutdown()
		}
	}
}

function performTest(connection, callback) {
	return makeTest(
		connection,
		async (t, s) => {
			const payload = {
				number: 1,
				letter: 'a',
				boolean: true,
			}

			await s.request('set', {
				json: true,
				method: 'post',
				body: payload,
				jar: true,
			})

			const response = await s.request('get', {
				json: true,
				jar: true,
			})

			t.deepEqual(response.body, payload)
		},
		callback,
	)
}

test('memory', performTest())
test(
	'database',
	performTest('database', app => {
		return app.routes.middleware.session.__store.db.schema.createTable('sessions', table => {
			table.string('id').unique()
			table.text('data')
			table.datetime('expires_at')
		})
	}),
)

test(
	'flash',
	makeTest('memory', async (t, s) => {
		const payload = { test: true }

		await s.request('flash', {
			json: true,
			method: 'post',
			body: payload,
			jar: true,
		})

		let response = await s.request('flash', {
			json: true,
			jar: true,
		})

		t.deepEqual(response.body, [payload])

		response = await s.request('flash', {
			json: true,
			jar: true,
		})

		t.deepEqual(response.body, [])
	}),
)

test(
	'old-input',
	makeTest('memory', async (t, s) => {
		const payload = { test: true }

		await s.request('old-input', {
			json: true,
			method: 'post',
			body: payload,
			jar: true,
		})

		let response = await s.request('old-input', {
			json: true,
			jar: true,
		})

		t.deepEqual(response.body, payload)

		response = await s.request('old-input', {
			json: true,
			jar: true,
		})

		t.deepEqual(response.body, void 0)
	}),
)
