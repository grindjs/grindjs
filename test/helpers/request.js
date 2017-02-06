import rp from 'request-promise-native'

import './Grind'
import '../../src/HttpServer'

let port = 0
export function request(boot, path, options = { }) {
	let app = null

	return (new HttpServer(() => {
		app = new Grind({
			port: 32200 + (++port)
		})

		app.routes.boot()
		boot(app)

		return app
	})).start().then(() => rp({
		...options,
		uri: `http://127.0.0.1:${app.port}/${path}`,
		resolveWithFullResponse: true
	})).then(response => {
		return app.shutdown().then(() => response)
	}).catch(err => {
		return app.shutdown().then(() => { throw err })
	})
}
