import fs from 'fs'
import path from 'path'

import { Application, MissingPackageError } from '@grindjs/framework'
import express, { IRoute, Request, Response } from 'express'

import { Controller } from '../Controller'
import { RoutesLoadError } from '../Errors/RoutesLoadError'
import { CompressionMiddlewareBuilder } from '../Middleware/CompressionMiddlewareBuilder'
import { CookieMiddlewareBuilder } from '../Middleware/CookieMiddlewareBuilder'
import { MethodOverrideMiddlewareBuilder } from '../Middleware/MethodOverrideMiddlewareBuilder'
import { SessionMiddlewareBuilder } from '../Middleware/SessionMiddlewareBuilder'
import { ResourceOptions, ResourceRouteBuilder } from './ResourceRouteBuilder'
import { RouteLayer } from './RouteLayer'
import { UpgradeHandler } from './UpgradeDispatcher'

export type NextHandleFunction = (error?: any) => void
export type RouterMiddlewareFunction = (
	req: Request,
	res: Response,
	next: NextHandleFunction,
) => void
export type RouterMiddleware = string | RouterMiddlewareFunction
export type RouterMiddlwareCollection = RouterMiddleware | RouterMiddleware[]

export type RouterControllerParam = Controller | (new (app: Application) => Controller)

export type RouterGroupOptions = Partial<{
	controller: RouterControllerParam
	before: RouterMiddlwareCollection
	after: RouterMiddlwareCollection
	prefix: string
}>

export type RouterActionFunction = (
	req: Request,
	res: Response,
	next: NextHandleFunction,
) => void | Promise<void>

export type RouterParamResolver = {
	(
		value: any,
		resolve: (value: any) => void,
		reject: (error: Error) => void,
		req: Request,
		res: Response,
	): Promise<any> | any
}

export type RouterAction =
	| RouterActionFunction
	| string
	| {
			method: string
			controller?: Controller
			as?: string
			before?: RouterMiddleware[]
			after?: RouterMiddleware[]
	  }

export type RouterGroupCallback = (routes: Router, controller?: object) => void

export type RouterScope = {
	prefix: string
	action: {
		controller?: Controller
		before: (string | RouterMiddlewareFunction)[]
		after: (string | RouterMiddlewareFunction)[]
	}
}

export type RouterMethod =
	| 'get'
	| 'post'
	| 'put'
	| 'delete'
	| 'patch'
	| 'options'
	| 'head'
	| 'checkout'
	| 'copy'
	| 'lock'
	| 'merge'
	| 'mkactivity'
	| 'mkcol'
	| 'move'
	| 'm-search'
	| 'notify'
	| 'purge'
	| 'report'
	| 'search'
	| 'subscribe'
	| 'trace'
	| 'unlock'
	| 'unsubscribe'

export class Router {
	router: express.Router

	bindings: Record<string, { resolver: RouterParamResolver; context?: any }> = {}
	patterns: Record<string, string> = {}
	namedRoutes: Record<string, express.IRoute> = {}
	upgraders: Record<string, UpgradeHandler> = {}

	bodyParserMiddleware: string[] = []

	middleware: Record<string, RouterMiddlewareFunction> = {}
	middlewareBuilders: Record<
		string,
		(
			app: Application,
			router: Router,
		) => RouterMiddlewareFunction | Record<string, RouterMiddlewareFunction>
	> = {
		'compression': CompressionMiddlewareBuilder,
		'cookie': CookieMiddlewareBuilder,
		'method-override': MethodOverrideMiddlewareBuilder,
		'session': SessionMiddlewareBuilder,
	}

	resourceRouteBuilderClass = ResourceRouteBuilder

	_scope: RouterScope[] = [
		{
			prefix: '/',
			action: {
				before: [],
				after: [],
			},
		},
	]

	get _scopedAction() {
		return this._scope[this._scope.length - 1].action
	}

	get _scopedPrefix() {
		return this._scope[this._scope.length - 1].prefix
	}

	constructor(public app: Application) {
		this.router = express.Router()
		this.app.express!.use(this.router)

		this.router.param('__middlewareWorkaround', (req, res, next: NextHandleFunction) => {
			req.route.dispatchMiddleware(req, res, next)
		})
	}

	boot() {
		this.app.emit('router:boot', this.app, this)
		this.setupBodyParsers()
		this.setupMiddleware()
	}

	setupBodyParsers() {
		const bodyParsersConfig: any = this.app.config.get('routing.body_parsers') || {}
		const parsers = bodyParsersConfig.default || ['json', 'form']
		const options = bodyParsersConfig.options || {}

		if (!Array.isArray(parsers)) {
			this.bodyParserMiddleware = !parsers ? [] : [parsers]
		} else {
			this.bodyParserMiddleware = parsers
		}

		const bodyParser = require('body-parser')
		this.middleware.json = bodyParser.json(options.json || {})
		this.middleware.form = bodyParser.urlencoded(options.form || { extended: true })
	}

	setupMiddleware() {
		for (const name of this.app.config.get('routing.middleware', []) as string[]) {
			if (!this.middlewareBuilders[name]) {
				Log.error(`ERROR: Could not find middleware builder for: ${name}`)
				continue
			}

			const middleware = this.middlewareBuilders[name](this.app, this)

			if (!middleware) {
				Log.error(`ERROR: Unable to load middleware for: ${name}`)
				continue
			}

			if (typeof middleware === 'function') {
				this.middleware[name] = middleware
				this.router.use(middleware)
			} else if (typeof middleware === 'object') {
				for (const [childName, childMiddleware] of Object.entries(middleware)) {
					this.middleware[childName] = childMiddleware
					this.router.use(childMiddleware)
				}
			} else {
				Log.error(`ERROR: Unknown middleware for: ${name}`)
			}
		}
	}

	group(options: RouterGroupOptions | RouterGroupCallback, callback: RouterGroupCallback) {
		if (typeof options === 'function') {
			callback = options as RouterGroupCallback
			options = {}
		}

		if (options.controller && typeof options.controller === 'function') {
			options.controller = new options.controller(this.app)
		}

		const before = makeArray(options.before)
		const after = makeArray(options.after)

		const parentAction = this._scopedAction
		const scope: RouterScope = {
			prefix: path.join(
				this._scopedPrefix,
				this._normalizePathComponent(options.prefix || '/'),
			),
			action: {
				...this._scopedAction,
				before: [...parentAction.before, ...before],
				after: [...parentAction.after, ...after],
			},
		}

		if (options.controller) {
			scope.action.controller = options.controller
		}

		this._scope.push(scope)
		callback(this, options.controller)
		this._scope.pop()

		return this
	}

	load(pathname: string) {
		if (!path.isAbsolute(pathname)) {
			const restore = Error.prepareStackTrace
			Error.prepareStackTrace = (_, stack) => stack
			const stack = (new Error().stack as unknown) as any[]
			Error.prepareStackTrace = restore

			pathname = path.resolve(path.dirname(stack[1].getFileName()), pathname)
		}

		try {
			pathname = require.resolve(pathname)
		} catch (err) {
			// Ignore and just use original name, which is likely a directory
		}

		let stats = fs.statSync(pathname)

		if (stats.isDirectory()) {
			try {
				const index = path.join(pathname, 'index.js')
				const indexStats = fs.statSync(index)

				if (indexStats.isFile()) {
					pathname = index
					stats = indexStats
				}
			} catch (e) {
				// Will load each file in the directory
			}
		}

		const files = []

		if (stats.isDirectory()) {
			files.push(
				...fs
					.readdirSync(pathname)
					.filter(file => path.extname(file) === '.js')
					.map(file => path.resolve(pathname, file)),
			)
		} else {
			files.push(pathname)
		}

		const loaders = files.map(file => {
			let name = path.basename(file, '.js')

			if (name === 'index') {
				name = path.basename(path.dirname(file))
			}

			let loader = null

			try {
				loader = require(file)[name]
			} catch (err) {
				throw new RoutesLoadError(
					err,
					`Unable to load routes file: ${path.relative(process.cwd(), file)}`,
				)
			}

			if (!loader) {
				throw new RoutesLoadError(
					`Invalid routes file: ${path.relative(process.cwd(), file)}`,
				)
			}

			return loader
		})

		loaders.sort((a, b) => {
			const priorityA = a.priority || 0
			const priorityB = b.priority || 0

			if (priorityA === priorityB) {
				return a.name.localeCompare(b.name) < 0 ? -1 : 1
			}

			return priorityA > priorityB ? -1 : 1
		})

		for (const loader of loaders) {
			try {
				this.group(loader.options || {}, (routes, ...args) => {
					loader(routes, this.app, ...args)
				})
			} catch (err) {
				if (err instanceof RoutesLoadError) {
					throw err
				}

				throw new RoutesLoadError(err, `Unable to load routes: ${loader.name}`)
			}
		}

		return this
	}

	use(...middleware: RouterMiddleware[]) {
		if (this._scope.length === 1) {
			this.router.use(
				...middleware.map(middleware =>
					typeof middleware === 'string'
						? this.resolveMiddleware(middleware)
						: middleware,
				),
			)
		} else {
			this._scopedAction.before.push(...middleware)
		}

		return this
	}

	static(pathname: string, filePath?: string, options?: Record<string, string>) {
		pathname = this._normalizePathComponent(pathname)

		if (!filePath) {
			filePath = path.join(this._scopedPrefix, pathname)
			filePath = this.app.paths.public(filePath)
		} else if (filePath.substring(0, 1) !== '/') {
			filePath = this.app.paths.public(filePath)
		}

		const action = this._scopedAction
		const handlers = this.resolveHandlers([
			...action.before,
			express.static(filePath, options) as any,
			...action.after,
		])

		this.router.use(path.join(this._scopedPrefix, pathname), ...handlers)

		return this
	}

	get(pathname: string, action: RouterAction, context?: any) {
		return this.addRoute('get', pathname, action, context)
	}

	post(pathname: string, action: RouterAction, context?: any) {
		return this.addRoute('post', pathname, action, context)
	}

	put(pathname: string, action: RouterAction, context?: any) {
		return this.addRoute('put', pathname, action, context)
	}

	patch(pathname: string, action: RouterAction, context?: any) {
		return this.addRoute('patch', pathname, action, context)
	}

	delete(pathname: string, action: RouterAction, context?: any) {
		return this.addRoute('delete', pathname, action, context)
	}

	options(pathname: string, action: RouterAction, context?: any) {
		return this.addRoute('options', pathname, action, context)
	}

	head(pathname: string, action: RouterAction, context?: any) {
		return this.addRoute('head', pathname, action, context)
	}

	match(methods: RouterMethod[], pathname: string, action: RouterAction, context?: any) {
		return this.addRoute(methods, pathname, action, context)
	}

	resource(
		name: string,
		controller: RouterControllerParam,
		options: ResourceOptions = {},
		callback: RouterGroupCallback | null = null,
	) {
		if (typeof controller === 'function') {
			controller = new controller(this.app)
		}

		return new this.resourceRouteBuilderClass(this).buildRoutes(
			name,
			controller,
			options,
			callback,
		)
	}

	upgrade(pathname: string, handler: UpgradeHandler | null = null) {
		let returnValue: any = handler

		if (!handler) {
			let WebSocketServer = null

			try {
				WebSocketServer = require('ws').Server
			} catch (err) {
				throw new MissingPackageError('ws')
			}

			returnValue = new WebSocketServer({
				noServer: true,
			})

			handler = (req, socket, head) => {
				return returnValue.handleUpgrade(req, socket, head, (ws: any) => {
					returnValue.emit('connection', ws)
				})
			}
		}

		this.upgraders[this._compilePath(pathname)] = handler

		return returnValue
	}

	addRoute(
		methods: RouterMethod | RouterMethod[],
		pathname: string,
		action: RouterAction,
		context: any,
	) {
		if (typeof methods === 'string') {
			methods = [methods]
		}

		methods = methods.map(method => method.toLowerCase().trim() as RouterMethod)

		const handler = this._makeAction(action)
		const before = []
		const after = [...this._scopedAction.after]

		if (typeof action === 'object') {
			before.push(...makeArray(action.before))
			after.unshift(...makeArray(action.after))
		}

		const route = this.router.route(this._compilePath(pathname))
		route.context = context || {}
		route.grindRouter = this

		let layer = this.router.stack[this.router.stack.length - 1]

		if (this._scopedAction.before.length > 0) {
			layer = new RouteLayer(route, layer, this.resolveHandlers(this._scopedAction.before), {
				sensitive: (this.router as any).caseSensitive,
				strict: (this.router as any).strict,
				end: true,
			})

			this.router.stack[this.router.stack.length - 1] = layer
		}

		for (const method of methods) {
			const handlers: RouterMiddleware[] = [handler]

			if (method !== 'get' && method !== 'head') {
				handlers.unshift(...this.bodyParserMiddleware)
			}

			;(route[method] as any)(...this.resolveHandlers(handlers))
		}

		if (before.length > 0) {
			route.before(...this.resolveHandlers(before))
		}

		if (after.length > 0) {
			route.after(...this.resolveHandlers(after))
		}

		if (typeof action === 'object' && typeof action.as === 'string') {
			route.as(action.as)
		}

		return route
	}

	_compilePath(pathname: string) {
		pathname = this._normalizePathComponent(pathname)
		const fullPath = path.join('/', this._scopedPrefix, pathname)

		return fullPath.replace(/:([a-z0-0_\-.]+)/g, (param, name) => {
			const pattern = this.patterns[name]

			if (!pattern) {
				return param
			} else {
				return `${param}(${pattern})`
			}
		})
	}

	_makeAction(action: RouterAction): RouterActionFunction {
		if (typeof action === 'function') {
			return action
		}

		if (typeof action === 'string') {
			action = { method: action }
		}

		action = Object.assign({}, this._scopedAction, action)
		const method = (action.controller as any)?.[action.method]
		const controller = action.controller

		return (req: Request, res: Response, next: NextHandleFunction) => {
			const result = method.apply(controller, req, res, next)

			if (typeof result === 'object' && typeof result.catch === 'function') {
				return result.catch(next)
			}

			return result
		}
	}

	_normalizePathComponent(component: string) {
		component = path.normalize(component.trim()).replace(/^\//, '')

		if (component.length === 0) {
			return '/'
		}

		return component
	}

	bind(name: string, resolver: RouterParamResolver, context: any) {
		this.bindings[name] = { resolver }

		if (context) {
			this.bindings[name].context = context
		}

		this.router.param(name, (req, res, next, value) => {
			const resolve = (newValue: any) => {
				req.params[name] = newValue
				next()
			}

			const reject = next
			const result = resolver(value, resolve, reject, req, res)

			if (typeof result?.then !== 'function') {
				return
			}

			result.then(resolve).catch(reject)
		})
	}

	pattern(name: string, pattern: string) {
		this.patterns[name] = pattern
	}

	nameRoute(name: string, route: IRoute) {
		route.routeName = name
		this.namedRoutes[name] = route
	}

	registerMiddleware(name: string, middleware: RouterMiddlewareFunction) {
		this.middleware[name] = middleware
	}

	resolveHandlers(handlers: RouterMiddleware[]): RouterMiddlewareFunction[] {
		return handlers.map(handler => this.resolveMiddleware(handler))
	}

	resolveMiddleware(middleware: RouterMiddleware): RouterMiddlewareFunction {
		if (typeof middleware === 'function') {
			return middleware
		}

		if (!this.middleware[middleware]) {
			throw new Error(`Unknown middleware alias: ${middleware}`)
		}

		return this.middleware[middleware]
	}

	trustProxy(val: any) {
		this.app.express!.set('trust proxy', val)
	}
}

function makeArray<T>(value: T | T[] | undefined | null): T[] {
	if (!value) {
		return []
	}

	if (Array.isArray(value)) {
		return value
	}

	return [value]
}
