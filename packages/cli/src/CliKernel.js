import { Kernel } from 'grind-framework'

import './Cli'

export class CliKernel extends Kernel {

	static type = 'cli'

	constructor(app, options) {
		super(app, options)

		app.cli = new Cli(app)

		let HttpCommandsProvider = null

		try {
			// If we have grind-http, load it’s standard commands
			HttpCommandsProvider = require('grind-http').CommandsProvider
		} catch(err) {
			return
		}

		HttpCommandsProvider(app)
	}

	start(...args) {
		return this.app.cli.run(...args)
	}

	get providers() {
		try {
			// If we have grind-http, load it’s standard providers
			// to provide routing/url which are likely expected
			// by any app that has grind-http added.
			return require('grind-http').standardProviders
		} catch(err) {
			return [ ]
		}
	}

}
