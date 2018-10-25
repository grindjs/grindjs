import {
	Application,
	Paths as BasePaths
} from 'grind-framework'

import { HttpKernel } from 'grind-http'

const path = require('path')

class Paths extends BasePaths {

	constructor() {
		super(path.join(__dirname, '../fixtures'))
	}

}

export class Grind extends Application {

	constructor(parameters = { }) {
		parameters.pathsClass = parameters.pathsClass || Paths
		super(HttpKernel, parameters)
	}

}
