import './Globals/Filters'
import './Globals/Functions'

import Nunjucks from 'nunjucks'

export class ViewFactory {
	app = null
	nunjucks = null

	constructor(app) {
		this.app = app

		const viewPath = app.paths.base(app.config.get('view.path', 'resources/views'))

		const loader = new Nunjucks.FileSystemLoader(viewPath, {
			watch: app.config.get('view.watch', app.env() === 'local'),
			noCache: app.config.get('view.disable_cache', false)
		})

		this.nunjucks = new Nunjucks.Environment(loader, {
			autoescape: app.config.get('view.autoescape', true),
			trimBlocks: app.config.get('view.trim_blocks', false),
			lstripBlocks: app.config.get('view.lstrip_blocks', false),
			throwOnUndefined: app.config.get('view.throw_on_undefined', false)
		})
		this.nunjucks.express(app.express)

		Filters(this)
		Functions(this)
	}

	share(name, value) {
		this.nunjucks.addGlobal(name, value)
	}

	addFilter(name, callback) {
		this.nunjucks.addFilter(callback)
	}

	addFunction(name, callback) {
		this.nunjucks.addGlobal(name, callback)
	}

	addExtension(name, extension) {
		this.nunjucks.addExtension(name, extension)
	}

}
