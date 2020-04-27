import { CliKernel } from 'grind-cli'
import { CacheProvider } from 'grind-cache'

import { Application as BaseApplication, Paths as BasePaths } from 'grind-framework'

import '../../src/QueueProvider'
import './TestJob'

const path = require('path')

class Paths extends BasePaths {
	constructor() {
		super(path.join(__dirname, '../fixtures'))
	}
}

export class Application extends BaseApplication {
	constructor(kernel = CliKernel, boot = null) {
		super(kernel, {
			pathsClass: Paths,
		})

		if (typeof boot === 'function') {
			boot(this)
		}

		CacheProvider(this)
		QueueProvider(this)

		this.queue.register(TestJob)
	}
}
