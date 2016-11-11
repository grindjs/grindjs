import './Globals/Filters'
import './Globals/Functions'

import './ViewEnvironment'
import './FS'

import Nunjucks from 'nunjucks'
import Path from 'path'

export class ViewFactory {
	app = null
	nunjucks = null
	viewPath = null

	constructor(app) {
		this.app = app

		this.viewPath = app.paths.base(app.config.get('view.path', 'resources/views'))

		const loader = new Nunjucks.FileSystemLoader(this.viewPath, {
			watch: app.config.get('view.watch', app.env() === 'local'),
			noCache: app.config.get('view.disable_cache', false)
		})

		this.nunjucks = new ViewEnvironment(loader, {
			autoescape: app.config.get('view.autoescape', true),
			trimBlocks: app.config.get('view.trim_blocks', false),
			lstripBlocks: app.config.get('view.lstrip_blocks', false),
			throwOnUndefined: app.config.get('view.throw_on_undefined', false)
		})
		this.nunjucks.express(app.express)
		app.express.set('view engine', 'njk')

		Filters(this)
		Functions(this)
	}

	exists(view) {
		return FS.stat(Path.join(this.viewPath, view))
		.then(stats => stats.isFile())
		.catch(err => {
			if(err.code === 'ENOENT') {
				return false
			}

			throw err
		})
	}

	share(name, value) {
		this.nunjucks.addGlobal(name, value)
	}

	addFilter(name, callback) {
		this.nunjucks.addFilter(name, callback)
	}

	addFunction(name, callback) {
		this.nunjucks.addGlobal(name, callback)
	}

	addExtension(name, extension) {
		this.nunjucks.addExtension(name, extension)
	}

	render(name, context) {
		return new Promise((resolve, reject) => {
			this.nunjucks.render(name, context, (err, result) => {
				if(!err.isNil) {
					return reject(err)
				}

				return resolve(result)
			})
		})
	}

}
