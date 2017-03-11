/* eslint-disable no-unused-vars */

export class ViewEngine {
	app = null
	view = null

	constructor(app, view) {
		this.app = app
		this.view = view
	}

	bootstrap() {
		return Promise.resolve()
	}

	share(name, value) {
		throw new Error('Subclasses must implement.')
	}

	filter(name, callback) {
		throw new Error('This engine does not support filters.')
	}

	extend(name, extension) {
		throw new Error('Subclasses must implement.')
	}

	render(name, context) {
		throw new Error('Subclasses must implement.')
	}

	toHtmlString(html) {
		throw new Error('Subclasses must implement.')
	}

	isHtmlString(html) {
		throw new Error('Subclasses must implement.')
	}

}
