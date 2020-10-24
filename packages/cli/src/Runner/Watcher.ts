import { Application } from '@grindjs/framework'
import { Watcher as BaseWatcher } from '@grindjs/support'
import chalk from 'chalk'

export type RestartHandler = (app: Application) => void

export class Watcher extends BaseWatcher {
	hasBooted = false

	constructor(
		public runner: import('../Runner').Runner,
		dirs: string[],
		restartHandler?: RestartHandler,
	) {
		super(dirs)

		this.restart = async () => {
			if (!this.hasBooted) {
				this.hasBooted = true
				return
			}

			console.log(chalk.yellow('Restarting'))
			const oldApp = this.runner.app
			this.runner.app = null
			;(oldApp as any).runner = null

			if (typeof restartHandler === 'function' && oldApp) {
				restartHandler(oldApp)
			}

			await oldApp?.shutdown()

			return Promise.resolve(this.runner.bootstrapper()).then(app => {
				setTimeout(() => (app as any).cli.run())
			})
		}
	}

	watch() {
		return super.watch().then(() => this.runner) as any
	}
}
