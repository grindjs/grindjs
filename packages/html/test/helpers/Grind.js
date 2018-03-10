import 'babel-polyfill'
import path from 'path'

import {
	Application,
	Paths as BasePaths
} from 'grind-framework'

import { HttpKernel } from 'grind-http'
import { ViewProvider } from 'grind-view'

class Paths extends BasePaths {

	constructor() {
		super(path.join(__dirname, '../fixtures'))
	}

}

export class Grind extends Application {

	constructor(parameters = { }) {
		parameters.pathsClass = Paths
		super(HttpKernel, parameters)

		this.providers.add(ViewProvider)
	}

}
