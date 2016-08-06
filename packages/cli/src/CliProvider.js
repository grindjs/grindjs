import './Cli'

export function CliProvider(app) {
	app.set('cli', new Cli(app))
}

CliProvider.priority = 100000
