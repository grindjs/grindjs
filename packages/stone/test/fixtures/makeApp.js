import '../../src/StoneEngine'

import { Grind, Paths as BasePaths } from 'grind-framework'
import { ViewProvider, ViewFactory } from 'grind-view'

ViewFactory.engines.stone = (...args) => new StoneEngine(...args)

class Paths extends BasePaths {

	constructor(bootstrapper) {
		super(bootstrapper, __dirname)
	}

}

export async function makeApp() {
	const app = new Grind({ pathsClass: Paths })
	app.providers.push(ViewProvider)
	await app.boot()

	app.view.viewPath = `${__dirname}/views`

	return app
}
