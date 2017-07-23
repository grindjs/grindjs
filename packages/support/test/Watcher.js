/* eslint-disable no-sync */

import { serial as test } from 'ava'
import path from 'path'

import { FS, Watcher } from '../src'

class WatchNeverFiredError extends Error { constructor() { super('Watch never fired') } }

function watchCatcher(t) {
	return err => {
		if(err instanceof WatchNeverFiredError) {
			t.fail(err.message)
		}

		throw err
	}
}

function delay(timeout) {
	return new Promise(resolve => setTimeout(resolve, timeout))
}

async function startWatching(watch, { before = () => { }, watching = () => { }, restart = () => { } }) {
	const watcher = new Watcher([ watch ])
	watcher.restart = () => { }

	await before()
	await watcher.watch()
	await watching()

	return new Promise((resolve, reject) => {
		const timeout = setTimeout(() => reject(new WatchNeverFiredError), 500)

		watcher.restart = async () => {
			clearTimeout(timeout)

			try {
				await restart()
			} catch(err) {
				return reject(err)
			}

			resolve()
		}
	})
}

test('simple watch - add', async t => {
	const watch = path.join(__dirname, 'fixtures/watch/simple')
	const file = path.join(watch, 'test.txt')

	if(await FS.exists(file)) {
		await FS.unlink(file)
	}

	return startWatching(watch, {
		watching: () => setTimeout(() => FS.writeFile(file, Date.now()), 50),
		restart: () => t.pass()
	}).catch(watchCatcher(t))
})

test('simple watch - change', async t => {
	const watch = path.join(__dirname, 'fixtures/watch/simple')
	const file = path.join(watch, 'test.txt')

	await FS.writeFile(file, 'start')

	return startWatching(watch, {
		watching: () => setTimeout(() => FS.writeFile(file, Date.now()), 50),
		restart: () => t.pass()
	}).catch(watchCatcher(t))
})

test('shouldn’t watch', async t => {
	const watch = path.join(__dirname, 'fixtures/watch/simple')
	const file = path.join(watch, 'test.txt')

	if(await FS.exists(file)) {
		await FS.unlink(file)
	}

	return startWatching(path.join(__dirname, 'fixtures/watch/cache'), {
		watching: () => setTimeout(() => FS.writeFile(file, Date.now()), 50),
		restart: () => t.fail('Watched a file it shouldn’t have')
	}).catch(err => {
		if(!(err instanceof WatchNeverFiredError)) {
			throw err
		}

		t.pass()
	})
})

test('ensure clear cache', async t => {
	const watch = path.join(__dirname, 'fixtures/watch/cache')
	const before = { value: 1 }
	const after = { value: 2 }
	const file = path.join(watch, 'test.js')

	if(await FS.exists(file)) {
		await FS.unlink(file)
	}

	const writeJson = json => {
		return FS.writeFile(file, `module.exports = ${JSON.stringify(json)}`).then(() => delay(1000))
	}

	return startWatching(watch, {
		before: async () => {
			// Initial sanity check
			await writeJson(before)
			t.deepEqual(require(file), before)

			// Make sure clearing cache + writing after workrs
			delete require.cache[file]
			await writeJson(after)
			t.deepEqual(require(file), after)

			// Restore before
			delete require.cache[file]
			await writeJson(before)
			t.deepEqual(require(file), before)
		},

		watching: () => setTimeout(() => writeJson(after), 300),
		restart: () => t.deepEqual(require(file), after)
	}).catch(watchCatcher(t))
})
