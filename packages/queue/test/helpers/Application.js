import { CliKernel } from 'grind-cli'

import {
	Application as BaseApplication,
	Paths as BasePaths
} from 'grind-framework'

const path = require('path')

class Paths extends BasePaths {

	constructor() {
		super(path.join(__dirname, '../fixtures'))
	}

}

export class Application extends BaseApplication {

	constructor() {
		super(CliKernel, {
			pathsClass: Paths
		})
	}

}
