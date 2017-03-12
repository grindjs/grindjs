import { ViewEngine } from 'grind-view'

import './Compiler'
import './HtmlString'
import './Template'
import './Watcher'

export class StoneEngine extends ViewEngine {
	compiler = null
	watcher = null

	context = {
		escape: Template.escape,
		HtmlString: HtmlString
	}

	constructor(app, view) {
		super(app, view)

		this.compiler = new Compiler(this)
	}

	bootstrap() {
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

		return Promise.resolve()
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
		return Promise.resolve(this._render(template, context))
	}

	_render(template, context) {
		const compiled = this.compiler.compile(this.resolve(template))
		const rendered = compiled({
			...this.context,
			...context,
			$engine: this,
			$compiler: this.compiler
		})

		return rendered
	}

	renderString(template, context) {
		const compiled = this.compiler.compileString(template)
		const rendered = compiled({
			...this.context,
			...context,
			$engine: this,
			$compiler: this.compiler
		})

		return rendered
	}

	resolve(template) {
		return `${this.view.viewPath}/${template.replace(/\./g, '/')}.stone`
	}

	toHtmlString(html) {
		return new HtmlString(html)
	}

	isHtmlString(html) {
		return html instanceof HtmlString
	}

}
