import './Grind'

import { HttpServer } from '@grindjs/http'
import getPort from 'get-port'

const fetch = require('fetchit')

export async function request(boot, path, options = {}) {
	const port = await getPort()
	let app = null

	return new HttpServer(() => {
		app = new Grind({ port })
		return app
	})
		.start()
		.then(() => {
			boot(app)

			return fetch(`http://127.0.0.1:${app.port}/${path}`, options)
		})
		.then(response => {
			return app.shutdown().then(() => response)
		})
		.catch(err => {
			return app.shutdown().then(() => {
				throw err
			})
		})
}
