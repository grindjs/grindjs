import { ViewEngine } from '../../grind-view'
import { FS } from 'grind-support'

const Nunjucks = require('nunjucks')
const path = require('path')

import './ViewEnvironment'

export class NunjucksEngine extends ViewEngine {
	nunjucks = null
	compiledViewPath = null

	constructor(app, view) {
		super(app, view)

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

		loaders.push(new Nunjucks.FileSystemLoader(this.view.viewPath, {
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

		this.filter('spaceless', html => this.toHtmlString(html.replace(/>\s+</g, '><')))
	}

	share(name, value) {
		this.nunjucks.addGlobal(name, value)
	}

	filter(name, callback) {
		this.nunjucks.addFilter(name, callback)
	}

	extend(name, extension) {
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

	async writeCache() {
		const result = Nunjucks.precompile(this.view.viewPath, {
			env: this.nunjucks,
			include: [ /\.njk$/ ],
			wrapper: templates => {
				let out = 'const templates = { };\nmodule.exports.templates = templates;\n\n'

				for(const template of templates) {
					const name = JSON.stringify(template.name)

					out += `templates[${name}] = (function() {${template.template}})();`
				}

				return out
			}
		})

		const dir = path.dirname(this.compiledViewPath)

		if(!(await FS.exists(dir))) {
			await FS.mkdirp(dir)
			await FS.writeFile(path.join(dir, '.gitignore'), '*\n!.gitignore\n')
		}

		await FS.writeFile(this.compiledViewPath, result)
	}

	async clearCache() {
		if(await FS.exists(this.compiledViewPath)) {
			await FS.unlink(this.compiledViewPath)
		}
	}

	toHtmlString(html) {
		return new Nunjucks.runtime.SafeString(html)
	}

	isHtmlString(html) {
		return html instanceof Nunjucks.runtime.SafeString
	}

}
