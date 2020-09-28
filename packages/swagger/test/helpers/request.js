import '../../src/SwaggerProvider'

import { Application, Paths as BasePaths } from '@grindjs/framework'
import { HttpKernel, HttpServer } from '@grindjs/http'

import fetch from 'fetchit'
import getPort from 'get-port'
import path from 'path'

class Paths extends BasePaths {
	constructor() {
		super(null, path.join(__dirname, '../..'))

		this._config = path.join(__dirname, '../fixtures/config')
	}
}

export async function makeServer(boot) {
	let app = null
	const port = await getPort()

	return new HttpServer(() => {
		app = new Application(HttpKernel, {
			port,
			pathsClass: Paths,
		})

		app.providers.add(SwaggerProvider)

		if (typeof boot.before === 'function') {
			boot.before(app)
		}

		return app
	})
		.start()
		.then(() => {
			boot(app)
			app.request = (path, options) => fetch(`http://127.0.0.1:${app.port}/${path}`, options)
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
