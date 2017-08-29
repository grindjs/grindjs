import { MissingPackageError } from 'grind-framework'
const EventEmitter = require('events')

export class ViewFactory extends EventEmitter {

	app = null
	viewPath = null
	engine = null
	engineName = null

	static engines = {
		stone: (...args) => ViewFactory.loadEngine('grind-stone', 'StoneEngine', ...args),
		nunjucks: (...args) => ViewFactory.loadEngine('grind-nunjucks', 'NunjucksEngine', ...args)
	}

	constructor(app) {
		super()

		this.app = app

		this.engineName = app.config.get('view.engine', 'stone')
		const makeEngine = ViewFactory.engines[this.engineName]

		if(makeEngine.isNil) {
			throw new Error(`View engine unavailable: ${this.engineName}`)
		}

		this.engine = makeEngine(app, this)
		this.viewPath = app.paths.base(app.config.get('view.path', 'resources/views'))
	}

	async bootstrap() {
		this.app.express.set('views', this.viewPath)

		await this.engine.bootstrap()

		this.share('markHtml', html => this.toHtmlString(html))
	}

	shutdown() {
		return this.engine.shutdown()
	}

	share(name, value) {
		return this.engine.share(name, value)
	}

	addFilter(name, callback) {
		Log.error('WARNING: addFilter has been renamed to filter and will be removed in 0.8.')
		return this.engine.filter(name, callback)
	}

	filter(name, callback) {
		return this.engine.filter(name, callback)
	}

	addFunction(name, callback) {
		Log.error('WARNING: addFunction has been deprecated will be removed in 0.8.')
		return this.engine.share(name, callback)
	}

	addExtension(name, extension) {
		Log.error('WARNING: addExtension has been renamed to extend and will be removed in 0.8.')
		return this.engine.extend(name, extension)
	}

	extend(name, extension) {
		return this.engine.extend(name, extension)
	}

	render(name, context) {
		return this.engine.render(name, context)
	}

	toHtmlString(html) {
		return this.engine.toHtmlString(html)
	}

	isHtmlString(html) {
		return this.engine.isHtmlString(html)
	}

	static loadEngine(module, className, ...args) {
		let engine = null

		try {
			engine = require(module)[className]
		} catch(err) {
			if(err.code !== 'MODULE_NOT_FOUND') {
				throw err
			}

			throw new MissingPackageError(module)
		}

		return new engine(...args)
	}

}
