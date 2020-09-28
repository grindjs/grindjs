import { Application, Paths as BasePaths } from '@grindjs/framework'
import { ViewFactory, ViewProvider } from '@grindjs/view'

import { HttpKernel } from '@grindjs/http'
import path from 'path'

class Paths extends BasePaths {
	constructor() {
		super(path.join(__dirname, '../fixtures'))
	}
}

export class Grind extends Application {
	constructor(parameters = {}) {
		parameters.pathsClass = Paths
		super(HttpKernel, parameters)

		this.providers.add(ViewProvider)
	}
}
