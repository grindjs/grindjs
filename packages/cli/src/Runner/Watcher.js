import { Watcher as BaseWatcher } from 'grind-support'

const chalk = require('chalk')

export class Watcher extends BaseWatcher {

	runner = null
	hasBooted = false

	constructor(runner, dirs, restartHandler) {
		super(dirs)

		this.runner = runner
		this.restart = async () => {
			if(!this.hasBooted) {
				this.hasBooted = true
				return
			}

			console.log(chalk.yellow('Restarting'))
			const oldApp = this.runner.app
			this.runner.app = null
			oldApp.runner = null

			if(typeof restartHandler === 'function') {
				restartHandler(oldApp)
			}

			await oldApp.shutdown()

			return this.runner.boot().then(app => {
				setTimeout(() => app.cli.run())
			})
		}
	}

	watch() {
		return super.watch().then(() => this.runner)
	}

}
