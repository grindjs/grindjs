import '../Commands/ProviderAddCommand'
import '../Commands/NewCommand'

export function CommandsProvider(app) {
	app.cli.commands.length = 0
	app.cli.register(ProviderAddCommand)
	app.cli.register(NewCommand)
}
