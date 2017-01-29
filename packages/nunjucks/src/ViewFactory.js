import './Globals/Filters'
import './Globals/Functions'

import './ViewEnvironment'

import { FS } from 'grind-support'
import Nunjucks from 'nunjucks'
import Path from 'path'

export class ViewFactory {
	app = null
	nunjucks = null
	viewPath = null
	compiledViewPath = null

	constructor(app) {
		this.app = app

		this.viewPath = app.paths.base(app.config.get('view.path', 'resources/views'))
		this.compiledViewPath = app.paths.base('storage/views/compiled.js')
	}

	async bootstrap() {
		const loaders = [ ]

		if(await FS.exists(this.compiledViewPath)) {
			try {
				const templates = require(this.compiledViewPath)

				if(!templates.isNil && !templates.templates.isNil) {
					loaders.push(new Nunjucks.PrecompiledLoader(templates.templates))
				}
			} catch(err) {
				Log.error('Unable to load compiled views', err)
			}
		}

		loaders.push(new Nunjucks.FileSystemLoader(this.viewPath, {
			dev: this.app.debug,
			watch: this.app.config.get('view.watch', this.app.debug),
			noCache: this.app.config.get('view.disable_cache', false)
		}))

		this.nunjucks = new ViewEnvironment(loaders, {
			dev: this.app.debug,
			autoescape: this.app.config.get('view.autoescape', true),
			trimBlocks: this.app.config.get('view.trim_blocks', false),
			lstripBlocks: this.app.config.get('view.lstrip_blocks', false),
			throwOnUndefined: this.app.config.get('view.throw_on_undefined', false)
		})
		this.nunjucks.express(this.app.express)
		this.app.express.set('view engine', 'njk')

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
