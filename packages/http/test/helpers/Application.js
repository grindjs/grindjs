require('babel-polyfill')
const path = require('path')

import {
	Application as BaseApplication,
	Paths as BasePaths
} from 'grind-framework'

class Paths extends BasePaths {

	constructor() {
		super(path.join(__dirname, '../fixtures'))
	}

}

export class Application extends BaseApplication {

	constructor(kernelClass, parameters = { }) {
		parameters.pathsClass = parameters.pathsClass || Paths
		super(kernelClass, parameters)
	}

}
