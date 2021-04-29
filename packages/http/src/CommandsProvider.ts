import { Application } from '@grindjs/framework'

import { ServeCommand } from './Commands/ServeCommand'
import { WatchCommand } from './Commands/WatchCommand'

export function CommandsProvider(app: Application) {
	app.cli!.register(ServeCommand)
	app.cli!.register(WatchCommand)
}
