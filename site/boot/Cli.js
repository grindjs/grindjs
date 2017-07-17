//
// WARNING: This file is *NOT* processed through babel
//

require('babel-register')
require('babel-polyfill')
require('grind-framework')

const { CliProvider, Runner } = require('grind-cli')

new Runner(() => {
	const app = require('../app/Bootstrap')
	const { CommandsProvider } = require('../app/Providers/CommandsProvider')
	app.providers.add(CliProvider, CommandsProvider)

	return app
}).run().catch(err => {
	Log.error('Boot Error', err)
	process.exit(1)
})
