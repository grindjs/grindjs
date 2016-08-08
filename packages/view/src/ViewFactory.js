import './Globals/Filters'
import './Globals/Functions'

import './ViewLoader'

import Nunjucks from 'nunjucks'
import fs from 'fs'
import path from 'path'

export class ViewFactory {
	app = null
	nunjucks = null
	viewPath = null

	constructor(app) {
		this.app = app

		this.viewPath = app.paths.base(app.config.get('view.path', 'resources/views'))

		const loader = new ViewLoader(this.viewPath, {
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
		app.express.set('view engine', 'njk')

		Filters(this)
		Functions(this)
	}

	exists(view) {
		return new Promise((resolve, reject) => {
			fs.stat(path.join(this.viewPath, view), (err, stats) => {
				if(!err.isNil) {
					if(err.code === 'ENOENT') {
						return resolve(false)
					}

					return reject(err)
				}

				resolve(stats.isFile())
			})
		})
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
