import 'App/Commands/SomeCommandCommand'

export function CommandsProvider(app) {
	// Removed bundled Grind commands
	app.cli.commands.length = 0

	// Load custom commands
	app.cli.register(SomeCommandCommand)
}
