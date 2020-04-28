export class Kernel {

	app = null
	as = null

	constructor(app, options = { }) {
		this.app = app
		this.options = options
	}

	start() {
		throw new Error('Subclasses must implement.')
	}

	shutdown() {
		throw new Error('Subclasses must implement.')
	}

	get providers() {
		return [ ]
	}

}
