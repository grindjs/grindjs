import test from 'ava'
import { makeServer } from './helpers/request'

class CustomError1 extends Error {}
class CustomError2 extends Error {}
class CustomError3 extends Error {}
class CustomError4 extends Error {}
class CustomError5 extends Error {}

function server() {
	return makeServer(app => {
		app.errorHandler.shouldntReport.push(CustomError1)
		app.errorHandler.shouldntReport.push(CustomError2)
		app.errorHandler.shouldntReport.push(CustomError3)
		app.errorHandler.shouldntReport.push(CustomError4)
		app.errorHandler.shouldntReport.push(CustomError5)

		app.errorHandler.register(CustomError2, () => ({
			custom: true,
			code: 418,
		}))

		app.errorHandler.register(CustomError3, (info, req, res) => res.send({ intercepted: true }))

		app.errorHandler.register(CustomError4, (err, req, res) => {
			res.set('X-Error', 'true')
			return { code: 418 }
		})

		app.errorHandler.register(CustomError5, () => {
			throw new CustomError1('error-in-error')
		})

		app.routes.post('error', req => {
			throw new CustomError1(req.body.message)
		})
		app.routes.get('custom-handler', () => {
			throw new CustomError2('testing')
		})
		app.routes.get('custom-response', () => {
			throw new CustomError3('testing')
		})
		app.routes.get('custom-header', () => {
			throw new CustomError4('testing')
		})
		app.routes.get('error-in-error', () => {
			throw new CustomError5('testing')
		})
	})
}

function makeTest(builder, callback) {
	return async t => {
		const s = await server()

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

test(
	'test',
	makeTest(async (t, s) => {
		const message = new Date().toISOString()

		try {
			await s.request('error', {
				json: true,
				method: 'post',
				body: { message },
			})

			t.fail('Endpoint should have thrown error')
		} catch (err) {
			t.is(err.statusCode, 500)
			t.is(err.response.body.error, message)
		}
	}),
)

test(
	'custom-handler',
	makeTest(async (t, s) => {
		try {
			await s.request('custom-handler', {
				json: true,
			})

			t.fail('Endpoint should have thrown error')
		} catch (err) {
			t.is(err.statusCode, 418)
			t.is(err.response.body.custom, true)
		}
	}),
)

test(
	'custom-response',
	makeTest(async (t, s) => {
		const response = await s.request('custom-response', {
			json: true,
		})

		t.is(response.statusCode, 200)
		t.is(response.body.intercepted, true)
	}),
)

test(
	'custom-header',
	makeTest(async (t, s) => {
		try {
			await s.request('custom-header', {
				json: true,
			})

			t.fail('Endpoint should have thrown error')
		} catch (err) {
			t.is(err.statusCode, 418)
			t.is(err.response.headers['x-error'].toString(), 'true')
		}
	}),
)

test(
	'error-in-error',
	makeTest(async (t, s) => {
		try {
			await s.request('error-in-error', {
				json: true,
			})

			t.fail('Endpoint should have thrown error')
		} catch (err) {
			t.is(err.statusCode, 500)
			t.is(err.response.body.error, 'error-in-error')
		}
	}),
)
