import { serial as test } from 'ava'

import './helpers/TestJob'
import './helpers/Listener'
import './helpers/Service'

import '../src/Drivers/FaktoryDriver'

const service = new Service(test, 'faktory', {
	image: 'contribsys/faktory',
	port: 7419
})

test.beforeEach(t => {
	t.context.driver = new FaktoryDriver(null, {
		connection: {
			host: 'localhost',
			port: service.port
		}
	})

	return t.context.driver.connect()
})

test.afterEach.always(t => t.context.driver.destroy())

test('dispatch', async t => {
	const payload = { time: Date.now() }
	const job = new TestJob({ ...payload })

	await t.context.driver.dispatch(job)

	return Listener(t.context.driver, job => t.deepEqual(job.data.data, payload))
})

test('delayed dispatch', async t => {
	const payload = { time: Date.now() }
	const job = new TestJob({ ...payload })

	const dispatchedAt = Date.now()
	await t.context.driver.dispatch(job.$delay(5000))

	return Listener(t.context.driver, job => {
		// NOTE: Faktory’s spec says it will dispatch "within a few seconds"
		// of the delay time, so for test purposes, we can only ensure
		// that there was a delay at all, rather than the requested delay
		// as it does not appear to fully honor the request.
		t.is(Date.now() - dispatchedAt >= 1000, true)
		t.deepEqual(job.data.data, payload)
	})
})

test('retry dispatch', async t => {
	const payload = { time: Date.now() }
	const job = new TestJob({ ...payload })
	let tries = 0

	await t.context.driver.dispatch(job.$tries(2))

	return Listener(t.context.driver, job => {
		t.is(job.tries, 2)
		t.deepEqual(job.data.data, payload)

		if(++tries === 1 || tries > 2) {
			throw new Error
		}
	})
})

test('multi dispatch', t => {
	let count = 0

	setTimeout(() => t.context.driver.dispatch(new TestJob({ id: 1 })), 50)
	setTimeout(() => t.context.driver.dispatch(new TestJob({ id: 2 })), 100)
	setTimeout(() => t.context.driver.dispatch(new TestJob({ id: 3 })), 200)
	setTimeout(() => t.context.driver.dispatch(new TestJob({ id: 4 })), 400)

	return Listener(t.context.driver, () => ++count < 4).then(() => t.is(count, 4))
})

test('resiliency', async t => {
	let count = 0

	await t.context.driver.dispatch(new TestJob({ id: 1 }))
	t.context.driver.client.socket.destroy()

	await t.context.driver.dispatch(new TestJob({ id: 1 }))

	return Listener(t.context.driver, () => ++count < 2).then(() => t.is(count, 2))
})
