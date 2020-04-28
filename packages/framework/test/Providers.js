import test from 'ava'
import './helpers/Application'

function wait(time) {
	new Promise(resolve => setTimeout(resolve, time))
}

function makeApp(provider) {
	const app = new Application
	app.providers.storage = [ ]
	app.providers.add(provider)
	return app
}

test('boot', async t => {
	let booted = false

	function TestProvider() {
		booted = true
	}

	await makeApp(TestProvider).boot()
	t.is(booted, true)
})

test('boot async', async t => {
	let booted = false

	async function TestProvider() {
		await wait(100)
		booted = true
	}

	await makeApp(TestProvider).boot()
	t.is(booted, true)
})

test('shutdown', async t => {
	let shutdown = false

	function TestProvider() { }
	TestProvider.shutdown = () => {
		shutdown = true
	}

	const app = makeApp(TestProvider)
	await app.boot()
	await app.shutdown()
	t.is(shutdown, true)
})

test('shutdown async', async t => {
	let shutdown = false

	function TestProvider() { }
	TestProvider.shutdown = async () => {
		await wait(100)
		shutdown = true
	}

	const app = makeApp(TestProvider)
	await app.boot()
	await app.shutdown()
	t.is(shutdown, true)
})

test('boot async + shutdown async', async t => {
	let booted = false
	let shutdown = false

	async function TestProvider() {
		await wait(100)
		booted = true
	}

	TestProvider.shutdown = async () => {
		await wait(100)
		shutdown = true
	}

	const app = makeApp(TestProvider)
	await app.boot()
	t.is(booted, true)

	await app.shutdown()
	t.is(shutdown, true)
})
