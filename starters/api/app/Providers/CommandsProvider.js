import 'App/Commands/StatesListCommand'

export function CommandsProvider(app) {
	app.cli.register(StatesListCommand)
}
