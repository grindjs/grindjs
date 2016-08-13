import 'App/Commands/NewCommand'

export function CommandsProvider(app) {
	app.cli.commands.length = 0
	app.cli.register(NewCommand)
}
