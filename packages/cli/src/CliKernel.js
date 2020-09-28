import './Cli'

import { Kernel } from '@grindjs/framework'

export class CliKernel extends Kernel {
	static type = 'cli'

	constructor(app, options) {
		super(app, options)

		app.cli = new Cli(app)

		let HttpCommandsProvider = null

		try {
			// If we have @grindjs/http, load it’s standard commands
			HttpCommandsProvider = require('@grindjs/http').CommandsProvider
		} catch (err) {
			return
		}

		HttpCommandsProvider(app)
	}

	start(...args) {
		return this.app.cli.run(...args)
	}

	get providers() {
		try {
			// If we have @grindjs/http, load it’s standard providers
			// to provide routing/url which are likely expected
			// by any app that has @grindjs/http added.
			return require('@grindjs/http').standardProviders
		} catch (err) {
			return []
		}
	}
}
