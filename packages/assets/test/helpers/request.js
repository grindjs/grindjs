import './Grind'

import { HttpServer } from 'grind-http'
const fetch = require('fetchit')

let port = 0
export function request(boot, path, options = { }) {
	let app = null

	return (new HttpServer(() => {
		app = new Grind({
			port: 32200 + (++port)
		})

		return app
	})).start().then(() => {
		boot(app)

		return fetch(`http://127.0.0.1:${app.port}/${path}`, options)
	}).then(response => {
		return app.shutdown().then(() => response)
	}).catch(err => {
		return app.shutdown().then(() => { throw err })
	})
}
