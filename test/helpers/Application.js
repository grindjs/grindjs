require('babel-polyfill')
const path = require('path')

import {
	Application as BaseApplication,
	Paths as BasePaths
} from '../../src'

import './TestKernel'

class Paths extends BasePaths {

	constructor() {
		super(path.join(__dirname, '../fixtures'))
	}

}

export class Application extends BaseApplication {

	constructor(parameters = { }) {
		parameters.pathsClass = parameters.pathsClass || Paths
		super(TestKernel, parameters)
	}

}
