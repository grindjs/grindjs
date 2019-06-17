import { serial as test } from 'ava'
import { HttpKernel } from 'grind-http'

import './helpers/TestJob'
import './helpers/Service'
import './helpers/Application'

const uuid = require('uuid/v4')
const fetch = require('fetchit')
const service = new Service(test, 'redis', {
	image: 'redis:5.0.5-alpine',
	port: 6379
})

test.beforeEach(t => {
	const app = new Application(HttpKernel)
	app.config.set('queue.connections.redis.port', service.port)

	t.context.app = app
	t.context.queue = app.queue
	t.context.driver = app.queue.get().driver
	t.context.queueName = uuid()

	return t.context.queue.get().connect()
})

test.afterEach.always(t => t.context.queue.destroy())

test('missing', async t => {
	t.deepEqual({ state: 'missing' }, await t.context.queue.status('non-existent'))
})

test('waiting', async t => {
	const { queue } = t.context
	const payload = { time: Date.now() }
	const job = new TestJob({ ...payload })
	const id = await queue.dispatch(job)

	const status = await queue.status(id)
	t.is('waiting', status.state)
	t.is(id, status.id)
	t.is('number', typeof status.lastActivity)
})

test('finished', async t => {
	const { queue } = t.context
	const payload = { time: Date.now() }
	const job = new TestJob({ ...payload })
	job.$queue(t.context.queueName)

	const id = await queue.dispatch(job)
	let status = await queue.status(id)
	t.deepEqual('waiting', status.state)

	queue.get().listen(t.context.queueName, 1)
	await (new Promise(resolve => setTimeout(resolve, 500)))

	status = await queue.status(id)
	t.is('done', status.state)
	t.is(id, status.id)
	t.is('number', typeof status.lastActivity)
})

test('failed', async t => {
	const { queue } = t.context
	const payload = { time: Date.now() }
	const job = new TestJob({ ...payload, fail: true })
	job.$queue(t.context.queueName)

	const id = await queue.dispatch(job)
	let status = await queue.status(id)
	t.deepEqual('waiting', status.state)

	queue.get().listen(t.context.queueName, 1)
	await (new Promise(resolve => setTimeout(resolve, 500)))

	status = await queue.status(id)
	t.is('failed', status.state)
	t.is(id, status.id)
	t.is('number', typeof status.lastActivity)
})

test('running', async t => {
	const { queue } = t.context
	const payload = { time: Date.now() }
	const job = new TestJob({ ...payload, wait: 500 })
	job.$queue(t.context.queueName)

	const id = await queue.dispatch(job)
	let status = await queue.status(id)
	t.deepEqual('waiting', status.state)

	queue.get().listen(t.context.queueName, 1)
	await (new Promise(resolve => setTimeout(resolve, 100)))

	status = await queue.status(id)
	t.is('running', status.state)
	t.is(id, status.id)
	t.is('number', typeof status.lastActivity)
})

test('results', async t => {
	const { queue } = t.context
	const payload = { time: Date.now() }
	const job = new TestJob({ result: payload })
	job.$queue(t.context.queueName)

	const id = await queue.dispatch(job)

	queue.get().listen(t.context.queueName, 1)
	await (new Promise(resolve => setTimeout(resolve, 500)))

	const status = await queue.status(id)

	t.is('done', status.state)
	t.is(id, status.id)
	t.is('number', typeof status.lastActivity)
	t.deepEqual(payload, status.result)
})

test('controller/missing', async t => {
	t.context.app.config.set('app.port', null)
	const server = t.context.app.http.start()
	const { port } = server.address()

	try {
		await fetch.json(`http://localhost:${port}/queue/non-existent`)
		t.fail()
	} catch(err) {
		t.is(404, err.statusCode)
		t.deepEqual({ state: 'missing' }, err.json)
	}
})

test('controller/waiting', async t => {
	t.context.app.config.set('app.port', null)
	const server = t.context.app.http.start()
	const { port } = server.address()

	const payload = { time: Date.now() }
	const job = new TestJob({ ...payload })
	const id = await t.context.app.queue.dispatch(job)

	const status = await fetch.json(`http://localhost:${port}/queue/${id}`)
	t.is('waiting', status.state)
	t.is(id, status.id)
	t.is('number', typeof status.lastActivity)
})

test('controller/results', async t => {
	const { queue, app } = t.context
	app.config.set('app.port', null)

	const server = t.context.app.http.start()
	const { port } = server.address()

	const payload = { time: Date.now() }
	const job = new TestJob({ result: payload })
	job.$queue(t.context.queueName)

	const id = await queue.dispatch(job)

	queue.get().listen(t.context.queueName, 1)
	await (new Promise(resolve => setTimeout(resolve, 500)))

	const status = await fetch.json(`http://localhost:${port}/queue/${id}`)
	t.is('done', status.state)
	t.is(id, status.id)
	t.is('number', typeof status.lastActivity)
	t.deepEqual(payload, status.result)
})
