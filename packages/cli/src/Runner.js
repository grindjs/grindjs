export class Runner {

	bootstrapper = null
	app = null

	constructor(bootstrapper) {
		this.bootstrapper = bootstrapper
	}

	async boot() {
		const app = this.bootstrapper()
		await app.boot()

		app.cli.runner = this
		this.app = app

		return app
	}

	run() {
		return this.boot().then(app => app.cli.run())
	}

}
