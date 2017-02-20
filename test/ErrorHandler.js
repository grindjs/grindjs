import test from 'ava'
import { makeServer } from './helpers/request'

class CustomError1 extends Error { }
class CustomError2 extends Error { }

function server() {
	return makeServer(80, app => {
		app.errorHandler.shouldntReport.push(CustomError1)
		app.errorHandler.shouldntReport.push(CustomError2)

		app.errorHandler.register(CustomError2, info => ({
			...info,
			custom: true,
			code: 418
		}))

		app.routes.post('error', req => { throw new CustomError1(req.body.message) })
		app.routes.get('custom-handler', () => { throw new CustomError2('testing') })
	})
}

function makeTest(builder, callback) {
	return async t => {
		const s = await server()

		if(!callback.isNil) {
			await callback(s)
		}

		try {
			await builder(t, s)
		} catch(err) {
			throw err
		} finally {
			await s.shutdown()
		}
	}
}

test('test', makeTest(async (t, s) => {
	const message = (new Date).toISOString()

	try {
		await s.request('error', {
			json: true,
			method: 'post',
			body: { message }
		})

		t.fail('Endpoint should have thrown error')
	} catch(err) {
		t.is(err.statusCode, 500)
		t.is(err.response.body.error, message)
	}
}))

test('custom-handler', makeTest(async (t, s) => {
	try {
		await s.request('custom-handler', {
			json: true
		})

		t.fail('Endpoint should have thrown error')
	} catch(err) {
		t.is(err.statusCode, 418)
		t.is(err.response.body.custom, true)
	}
}))
