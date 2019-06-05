import { serial as test } from 'ava'

import './helpers/TestJob'
import './helpers/Listener'
import './helpers/Service'

import '../src/Drivers/RabbitDriver'

const uuid = require('uuid/v4')

const service = new Service(test, 'rabbitmq', {
	image: 'rabbitmq:3.7-alpine',
	port: 5672
})

test.beforeEach(t => {
	t.context.queue = uuid()
	t.context.driver = new RabbitDriver(null, {
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
	const job = new TestJob({ ...payload }).$queue(t.context.queue)

	await t.context.driver.dispatch(job)

	return Listener(t.context.driver, job => t.deepEqual(job.data.data, payload), false, t.context.queue)
})

test('retry dispatch', async t => {
	const payload = { time: Date.now() }
	const job = new TestJob({ ...payload }).$queue(t.context.queue)
	let tries = 0

	await t.context.driver.dispatch(job.$tries(2))

	return Listener(t.context.driver, job => {
		t.is(job.tries, 2)
		t.deepEqual(job.data.data, payload)

		if(++tries === 1 || tries > 2) {
			throw new Error
		}
	}, false, t.context.queue)
})

test('multi dispatch', t => {
	let count = 0

	setTimeout(() => t.context.driver.dispatch(new TestJob({ id: 1 }).$queue(t.context.queue)), 50)
	setTimeout(() => t.context.driver.dispatch(new TestJob({ id: 2 }).$queue(t.context.queue)), 100)
	setTimeout(() => t.context.driver.dispatch(new TestJob({ id: 3 }).$queue(t.context.queue)), 200)
	setTimeout(() => t.context.driver.dispatch(new TestJob({ id: 4 }).$queue(t.context.queue)), 400)

	return Listener(t.context.driver, () => ++count < 4, false, t.context.queue).then(() => t.is(count, 4))
})

test('connection error - reconnect', async t => {
	const payload = { time: Date.now() }
	const job = new TestJob({ ...payload }).$queue(t.context.queue)

	await service.forceKill()
	setTimeout(() => service.start(), 500)
	await t.context.driver.dispatch(job)

	return Listener(t.context.driver, job => t.deepEqual(job.data.data, payload), false, t.context.queue)
})

test('connection error - fatal', async t => {
	const payload = { time: Date.now() }
	const job = new TestJob({ ...payload })

	await service.forceKill()

	try {
		await t.context.driver.dispatch(job)
		t.fail('Should not have dispatched.')
	} catch(err) {
		t.is(err.message, 'Unable to reconnect.')
	}
})
