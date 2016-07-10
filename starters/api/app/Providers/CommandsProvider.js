import 'App/Commands/StatesListCommand'

export function CommandsProvider(app) {
	app.get('cli').register(StatesListCommand)
}
