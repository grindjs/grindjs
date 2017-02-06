import rp from 'request-promise-native'

import './Grind'
import '../../src/HttpServer'

let port = 0
export function makeServer(boot) {
	let app = null

	return (new HttpServer(() => {
		app = new Grind({
			port: 32200 + (++port)
		})

		if(typeof boot.before === 'function') {
			boot.before(app)
		}

		return app
	})).start().then(() => {
		boot(app)

		app.request = (path, options) => rp({
			...options,
			uri: `http://127.0.0.1:${app.port}/${path}`,
			resolveWithFullResponse: true
		})

		return app
	})
}

export function request(boot, path, options = { }) {
	return makeServer(boot).then(server => {
		return server.request(path, options).then(response => {
			return server.shutdown().then(() => response)
		}).catch(err => {
			return server.shutdown().then(() => { throw err })
		})
	})
}
