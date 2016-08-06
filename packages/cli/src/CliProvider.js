import './Cli'

export function CliProvider(app) {
	app.cli = new Cli(app)
}

CliProvider.priority = 100000
