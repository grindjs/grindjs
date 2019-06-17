import { CliKernel } from 'grind-cli'
import { CacheProvider } from 'grind-cache'

import {
	Application as BaseApplication,
	Paths as BasePaths
} from 'grind-framework'

import '../../src/QueueProvider'
import './TestJob'

const path = require('path')

class Paths extends BasePaths {

	constructor() {
		super(path.join(__dirname, '../fixtures'))
	}

}

export class Application extends BaseApplication {

	constructor(kernel = CliKernel) {
		super(kernel, {
			pathsClass: Paths
		})

		CacheProvider(this)
		QueueProvider(this)

		this.queue.register(TestJob)
	}

}
