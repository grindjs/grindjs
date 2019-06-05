import { serial as test } from 'ava'

import './helpers/TestJob'
import './helpers/Listener'
import './helpers/Service'

import '../src/Drivers/BeanstalkDriver'

const service = new Service(test, 'beanstalk', {
	image: 'kusmierz/beanstalkd',
	port: 11300
})

test.beforeEach(t => {
	t.context.driver = new BeanstalkDriver(null, {
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
	await t.context.driver.dispatch(job.$delay(500))

	return Listener(t.context.driver, job => {
		t.is(Date.now() - dispatchedAt >= 500, true)
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
