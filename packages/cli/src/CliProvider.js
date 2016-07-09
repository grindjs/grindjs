import './Cli'

export function CliProvider(app) {
	app.set('cli', new Cli(app))
}
