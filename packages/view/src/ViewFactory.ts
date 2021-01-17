import EventEmitter from 'events'

import { MissingPackageError } from '@grindjs/framework'
import { Application } from '@grindjs/framework'

import { ViewEngine } from './ViewEngine'

export class ViewFactory extends EventEmitter {
	viewPath: string
	engine: ViewEngine
	engineName: string | null

	static engines: Record<string, (...args: any[]) => ViewEngine> = {
		stone: (...args) => ViewFactory.loadEngine('@grindjs/stone', 'StoneEngine', ...args),
	}

	constructor(public app: Application) {
		super()

		this.engineName = app.config.get('view.engine', 'stone') as string
		const makeEngine = ViewFactory.engines[this.engineName]

		if (typeof makeEngine !== 'function') {
			throw new Error(`View engine unavailable: ${this.engineName}`)
		}

		this.engine = makeEngine(app, this)
		this.viewPath = app.paths.base(app.config.get('view.path', 'resources/views') as string)
	}

	async bootstrap() {
		;(this.app as any).express?.set('views', this.viewPath)
		await this.engine.bootstrap()

		this.share('markHtml', (html: string) => this.toHtmlString(html))
	}

	shutdown() {
		return this.engine.shutdown()
	}

	share(name: string, value: any) {
		return this.engine.share(name, value)
	}

	extend(name: string, extension: string) {
		return this.engine.extend(name, extension)
	}

	render(name: string, context: any) {
		return this.engine.render(name, context)
	}

	toHtmlString(html: any) {
		return this.engine.toHtmlString(html)
	}

	isHtmlString(html: string) {
		return this.engine.isHtmlString(html)
	}

	static loadEngine(module: string, className: string, ...args: any[]) {
		let engine = null

		try {
			engine = require(module)[className]
		} catch (err) {
			if (err.code !== 'MODULE_NOT_FOUND') {
				throw err
			}

			throw new MissingPackageError(module)
		}

		return new engine(...args)
	}
}
