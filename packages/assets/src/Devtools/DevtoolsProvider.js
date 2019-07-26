import './Server/socket'
import './Server/inject'
import './Server/watch'
import './Server/shutdown'

export function DevtoolsProvider(app) {
	socket(app)

	app.on('shutdown', shutdown)

	watch(app)
	inject(app)
}
