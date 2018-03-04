import '../Commands/ProviderAddCommand'
import '../Commands/NewCommand'

export function CommandsProvider(app) {
	app.cli.commands.length = 0

	if(app.inProject) {
		app.cli.register(ProviderAddCommand)
	} else {
		app.cli.register(NewCommand)
	}
}
