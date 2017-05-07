/* eslint-disable no-sync */

import test from 'ava'
import path from 'path'

import '../src/Watcher'
import '../src/FS'

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
		const timeout = setTimeout(() => reject('Watch never fired'), 1000)

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

test.serial('simple watch', async t => {
	const watch = path.join(__dirname, 'fixtures/watch/simple')
	const file = path.join(watch, 'test.txt')

	if(await FS.exists(file)) {
		await FS.unlink(file)
	}

	return startWatching(watch, {
		watching: () => setTimeout(async () => FS.writeFile(file, Date.now()), 50),
		restart: () => t.pass()
	})
})

test.serial('ensure clear cache', async t => {
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
	})
})
