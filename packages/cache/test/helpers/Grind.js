import { Application, Paths as BasePaths, Kernel } from '@grindjs/framework'

import path from 'path'

class Paths extends BasePaths {
	constructor() {
		super(path.join(__dirname, '../fixtures'))
	}
}

export class TestKernel extends Kernel {
	start() {}
	shutdown() {}
}

export class Grind extends Application {
	constructor(parameters = {}) {
		parameters.pathsClass = Paths
		super(TestKernel, parameters)
	}
}
