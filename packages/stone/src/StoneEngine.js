import { ViewEngine } from 'grind-view'

import './CacheManager'
import './Compiler'
import './HtmlString'
import './StoneLoop'
import './Watcher'
import './StoneRuntime'

import './Support/escape'

export class StoneEngine extends ViewEngine {

	cacheManager = null
	compiler = null
	watcher = null
	runtime = null

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

		this.app.express.set('view', StoneExpressView)

		if(this.app.config.get('view.watch', this.app.debug)) {
			this.watcher = new Watcher(this, this.view.viewPath)
			this.watcher.start()
		}

		if(await this.cacheManager.exists()) {
			await this.cacheManager.load()
		}
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

	resolve(template) {
		return `${this.view.viewPath}/${template.replace(/\./g, '/')}.stone`
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
