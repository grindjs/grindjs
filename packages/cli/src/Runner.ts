import path from 'path'

import { Application } from '@grindjs/framework'

export class Runner {
	app: Application | null = null

	constructor(public bootstrapper: () => Application) {
		this.bootstrapper = bootstrapper
	}

	run() {
		const app = this.bootstrapper()
		this.app = app

		return app.start()
	}

	async watch(
		command: string,
		option: string,
		restartHandler: import('./Runner/Watcher').RestartHandler,
	) {
		// Build the dirs to watch
		const dirs = command.split(/,/).map(dir => {
			if (dir[0] === '/') {
				return dir
			}

			return path.join(process.cwd(), dir)
		})

		// Strip the option from `argv` to avoid infinite loops
		process.argv = process.argv.filter(arg => !arg.startsWith(`--${option}=`))

		// Kick off the watcher
		const { Watcher } = await import('./Runner/Watcher')
		return new Watcher(this, dirs, restartHandler).watch()
	}
}
