import '../../src/StoneEngine'

import { Grind, Paths as BasePaths } from 'grind-framework'
import { ViewProvider, ViewFactory } from 'grind-view'

ViewFactory.engines.stone = (...args) => new StoneEngine(...args)

class Paths extends BasePaths {

	constructor(bootstrapper) {
		super(bootstrapper, __dirname)
	}

}

export async function makeApp(before = () => { }) {
	const app = new Grind({ pathsClass: Paths })
	app.config.set('view.ignore-compiled', true)
	app.providers.add(ViewProvider)
	before(app)
	await app.boot()

	return app
}
