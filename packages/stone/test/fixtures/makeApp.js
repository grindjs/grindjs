import '../../src/StoneEngine'

import { Application, Paths as BasePaths } from '@grindjs/framework'
import { HttpKernel } from '@grindjs/http'
import { ViewProvider, ViewFactory } from '@grindjs/view'

ViewFactory.engines.stone = (...args) => new StoneEngine(...args)

class Paths extends BasePaths {
	constructor() {
		super(__dirname)
	}
}

export async function makeApp(before = () => {}) {
	const app = new Application(HttpKernel, { pathsClass: Paths })
	app.config.set('view.ignore-compiled', true)
	app.providers.add(ViewProvider)
	before(app)
	await app.boot()

	return app
}
