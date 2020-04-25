import rp from 'request-promise-native'

import './Application'
import '../../src/HttpKernel'
import '../../src/HttpServer/HttpServer'
import getPort from 'get-port'

export async function makeServer(boot) {
	const port = await getPort()
	let app = null

	return new HttpServer(() => {
		app = new Application(HttpKernel, {
			port,
		})

		if (typeof boot.before === 'function') {
			boot.before(app)
		}

		return app
	})
		.start()
		.then(() => {
			boot(app)

			app.request = (path, options) =>
				rp({
					...options,
					uri: `http://127.0.0.1:${app.port}/${path}`,
					resolveWithFullResponse: true,
				})

			return app
		})
}

export function request(boot, path, options = {}) {
	return makeServer(boot).then(server => {
		return server
			.request(path, options)
			.then(response => {
				return server.shutdown().then(() => response)
			})
			.catch(err => {
				return server.shutdown().then(() => {
					throw err
				})
			})
	})
}
