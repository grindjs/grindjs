import '../../src/QueueProvider'
import './TestJob'

import { Application as BaseApplication, Paths as BasePaths } from '@grindjs/framework'

import { CacheProvider } from '@grindjs/cache'
import { CliKernel } from '@grindjs/cli'

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
