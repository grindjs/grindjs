import 'babel-polyfill'
import rp from 'request-promise-native'

import './Application'
import '../../src/HttpKernel'
import '../../src/HttpServer'

let port = 0
export function makeServer(space, boot) {
	let app = null

	return (new HttpServer(() => {
		app = new Application(HttpKernel, {
			port: 32180 + space + (++port)
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

export function request(space, boot, path, options = { }) {
	return makeServer(space, boot).then(server => {
		return server.request(path, options).then(response => {
			return server.shutdown().then(() => response)
		}).catch(err => {
			return server.shutdown().then(() => { throw err })
		})
	})
}
