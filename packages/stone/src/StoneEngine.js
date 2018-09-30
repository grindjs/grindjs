import { ViewEngine } from 'grind-view'

import './CacheManager'
import './Compiler'
import './HtmlString'
import './StoneLoop'
import './Watcher'
import './StoneRuntime'

import './Support/escape'

const path = require('path')
const fs = require('fs')

export class StoneEngine extends ViewEngine {

	cacheManager = null
	compiler = null
	watcher = null
	runtime = null
	namespaces = { }

	context = {
		escape: escape,
		HtmlString: HtmlString,
		StoneLoop: StoneLoop,
		stringify: JSON.stringify
	}

	constructor(app, view) {
		super(app, view)

		this.cacheManager = new CacheManager(app, this)
		this.compiler = new Compiler(this)
		this.runtime = new StoneRuntime(this)
	}

	async bootstrap() {
		const engine = this

		function StoneExpressView(name) {
			this.template = name
			this.name = name
			this.path = name
		}

		StoneExpressView.prototype.render = function(context, callback) {
			let template = null

			try {
				template = engine._render(this.template, context)
			} catch(err) {
				return callback(err)
			}

			callback(null, template)
		}

		if(!this.app.express.isNil) {
			this.app.express.set('view', StoneExpressView)
		}

		if(this.app.config.get('view.watch', this.app.debug)) {
			this.watcher = new Watcher(this, this.view.viewPath)
			this.watcher.start()
		}

		const tags = this.app.config.get('view.tags')

		if(!tags.isNil) {
			for(const [ key, value ] of Object.entries(tags)) {
				if(value === '*') {
					this.tag(`${key}.*`)
					continue
				}

				this.tag(key, value)
			}
		}

		if(await this.cacheManager.exists()) {
			await this.cacheManager.load()
		}
	}

	namespace(namespace, path) {
		this.namespaces[namespace] = path
	}

	shutdown() {
		if(this.watcher.isNil) {
			return
		}

		return this.watcher.stop()
	}

	share(name, value) {
		this.context[name] = value
	}

	extend(name, extension) {
		this.compiler.directives[name] = extension
	}

	tag(name, template = null, namespace = null) {
		if(template.isNil) {
			if(name.endsWith('.*')) {
				const base = name.substring(0, name.length - 2)
				const pathname = path.join(this.view.viewPath, base.replace(/\./g, '/'))

				// eslint-disable-next-line no-sync
				const templates = fs.readdirSync(pathname)

				for(const template of templates) {
					const extname = path.extname(template)
					const name = path.basename(template, extname)

					if(extname === '.stone') {
						this.tag(`${base}.${name}`, null, namespace)
					} else if(
						// eslint-disable-next-line no-sync
						fs.lstatSync(path.join(pathname, template)).isDirectory()
					) {
						const templateNamespace = namespace.isNil ? template : `${namespace}:${template}`
						this.tag(`${base}.${template}.*`, null, templateNamespace)
					}
				}

				return
			}

			template = name
			name = template.split(/\./).pop().replace(/^_/g, '')
		}

		if(!namespace.isNil) {
			name = `${namespace}:${name}`
		}

		this.compiler.tags[name] = template
	}

	render(template, context) {
		this.view.emit('render:start', template)

		return Promise.resolve(this._render(template, context)).then(result => {
			this.view.emit('render:end', template, result)

			return result
		})
	}

	_render(template, context) {
		return this._renderCompiled(this.compiler.compile(this.resolve(template)), context)
	}

	renderString(template, context) {
		return this._renderCompiled(this.compiler.compileString(template), context)
	}

	_renderCompiled(compiled, context) {
		return compiled({
			...this.context,
			...context,
			$stone: this.runtime,
			$engine: this,
			$compiler: this.compiler
		})
	}

	resolve(template, relativeTo = null) {
		if(template.substring(0, 1) === '.' && typeof relativeTo === 'string') {
			let join = ''

			template = template.replace(/^(\.+)/, (_, dots) => {
				if(dots.length !== 1) {
					join = '../'.repeat(dots.length - 1)
				}

				return ''
			})

			return path.join(path.dirname(relativeTo), join, `${template.replace(/\./g, '/')}.stone`)
		}

		const index = template.indexOf('::')
		let viewPath = null

		if(index === -1) {
			viewPath = this.view.viewPath
		} else {
			const namespace = template.substring(0, index)
			viewPath = this.namespaces[namespace]

			if(typeof viewPath !== 'string') {
				throw new Error(`Invalid namespace: ${namespace}`)
			}

			template = template.substring(index + 2)
		}

		return path.join(viewPath, `${template.replace(/\./g, '/')}.stone`)
	}

	writeCache() {
		return this.cacheManager.write()
	}

	clearCache() {
		return this.cacheManager.clear()
	}

	toHtmlString(html) {
		return new HtmlString(html)
	}

	isHtmlString(html) {
		return html instanceof HtmlString
	}

}
