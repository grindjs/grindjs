require('babel-polyfill')
const path = require('path')

import {
	Application as BaseApplication,
	Paths as BasePaths
} from '../../src'

class Paths extends BasePaths {

	constructor() {
		super(null, path.join(__dirname, '../fixtures'))
	}

}

export class Application extends BaseApplication {

	constructor(parameters = { }) {
		parameters.pathsClass = parameters.pathsClass || Paths
		super(parameters)
	}

}
