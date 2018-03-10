const path = require('path')

export class Runner {

	app = null
	bootstrapper = null

	constructor(bootstrapper) {
		this.bootstrapper = bootstrapper
	}

	run() {
		const app = this.bootstrapper()
		this.app = app

		return app.start()
	}

	async watch(command, option, restartHandler) {
		// Build the dirs to watch
		const dirs = command.option(option).split(/,/).map(dir => {
			if(dir[0] === '/') {
				return dir
			}

			return path.join(process.cwd(), dir)
		})

		// Strip the option from `argv` to avoid infinite loops
		process.argv = process.argv.filter(arg => !arg.startsWith(`--${option}=`))

		// Kick off the watcher
		const Watcher = require('./Runner/Watcher').Watcher
		return (new Watcher(this, dirs, restartHandler)).watch()
	}

}
