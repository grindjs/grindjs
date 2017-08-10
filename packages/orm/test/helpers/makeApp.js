require('babel-polyfill')

import './Grind'
import { DatabaseProvider } from 'grind-db'
import { OrmProvider } from '../../src'

const path = require('path')
const crypto = require('crypto')
const fs = require('fs')

export async function makeApp(boot = () => { }) {
	const app = new Grind
	const dbPath = path.join(__dirname, `../fixtures/database/database-${crypto.randomBytes(4).toString('hex')}.sqlite`)

	app.config.set('database.connections.sqlite.filename', dbPath)

	app.providers.add(DatabaseProvider)
	app.providers.add(OrmProvider)

	await app.boot()
	await boot()

	await app.db.migrate.latest()
	await app.db.seed.run()

	app.on('shutdown', () => {
		try {
			// eslint-disable-next-line no-sync
			fs.unlinkSync(dbPath)
		} catch(err) {
			Log.error('Unable to remove test db', err)
		}
	})

	return app
}
