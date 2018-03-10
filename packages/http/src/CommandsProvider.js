import './Commands/ServeCommand'
import './Commands/WatchCommand'

export function CommandsProvider(app) {
	app.cli.register(ServeCommand)
	app.cli.register(WatchCommand)
}
