import { Config } from './Config'
import { ErrorHandler } from './ErrorHandler'
import { EventEmitter } from 'events'
import { Kernel } from './Kernel'
import { Paths } from './Paths'
import { Provider } from './Provider'
import { ProviderCollection } from './ProviderCollection'

/**
 * Main Application class for Grind
 */
export class Application extends EventEmitter {
	_env: string | null | undefined

	config: Config
	paths: Paths

	booted = false
	booting = false
	providers: ProviderCollection
	kernel: Kernel
	debug: boolean

	/**
	 * Create an instance of the Grind Application
	 *
	 * @param  {string}   options.env               Override env name
	 *                                              By default, env is populated by the NODE_ENV
	 *                                              environment variable. This value takes
	 *                                              precedence over all other values.
	 * @param  {integer}  options.port              Override port to listen on
	 *                                              By default, port is populated by the app.port
	 *                                              config value, with an optional override via the
	 *                                              NODE_PORT environment variable.  This value
	 *                                              takes precedence over all other values.
	 * @param  {Class}   options.routerClass        Override for Router class
	 * @param  {Class}   options.configClass        Override for Config class
	 * @param  {Class}   options.errorHandlerClass  Override for ErrorHandler class
	 * @param  {Class}   options.urlGeneratorClass  Override for UrlGenerator class
	 * @param  {Class}   options.pathsClass         Override for Paths class
	 */
	constructor(
		kernelClass: typeof Kernel,
		{
			env,
			port,
			routerClass,
			configClass,
			errorHandlerClass,
			urlGeneratorClass,
			pathsClass,
			...extra
		}: Partial<{
			env: string
			port: number
			routerClass: any
			configClass: typeof Config
			errorHandlerClass: typeof ErrorHandler
			urlGeneratorClass: any
			pathsClass: typeof Paths
		}> = {},
	) {
		super()

		this._env = env

		configClass = configClass ?? Config
		pathsClass = pathsClass ?? Paths

		this.paths = new pathsClass()
		this.config = new configClass(this)
		this.providers = new ProviderCollection(this)
		this.debug = this.config.get('app.debug', this.env() === 'local') === true
		this.on('error', (err: any) => Log.error('EventEmitter error', err))

		this.kernel = new kernelClass(this, {
			port,
			routerClass,
			errorHandlerClass,
			urlGeneratorClass,
			pathsClass,
			...extra,
		})

		if (typeof this.kernel.as === 'string') {
			;(this as any)[this.kernel.as] = this.kernel
		}

		for (const provider of this.kernel.providers) {
			this.providers.add(provider)
		}
	}

	/**
	 * @return {string} Current environment
	 */
	env() {
		return this._env || process.env.NODE_ENV || 'local'
	}

	/**
	 * Boots the current application, if not already booted.
	 * This will notify all registered providers and start them.
	 *
	 * @return {Promise}
	 */
	async boot() {
		if (this.booted) {
			return
		}

		this.booting = true
		this.providers.sort((a, b) => ((a.priority ?? 0) > (b.priority ?? 0) ? -1 : 1))

		for (const provider of this.providers) {
			await provider(this)
		}

		this.emit('boot', this)

		this.booted = true
		this.booting = false
	}

	/**
	 * Loads a Kernel Provider
	 *
	 * Kernel Providers are a special type of
	 * provider that get loaded immediately upon
	 * being added rather than delayed until boot.
	 *
	 * @param  function  provider
	 */
	loadKernelProvider(provider: Provider) {
		if (typeof provider.shutdown === 'function') {
			const shutdown = provider.shutdown.bind(provider, this)

			this.once('shutdown', () => {
				const result = shutdown()

				if (!result || typeof result.then !== 'function') {
					return
				}

				Log.warn('WARNING: Kernel Providers do not support async shutdown functions.')
				Log.warn('--> App shutdown is not waiting for this provider to finish.')
				Log.warn(`--> Offending provider: ${provider.name}`)
			})
		}

		const result = provider(this)

		if (!result || typeof result.then !== 'function') {
			return
		}

		throw new Error('Kernel Providers can not be async.')
	}

	/**
	 * Starts the Kernel
	 */
	async start(...args: any[]) {
		await this.boot()
		return this.kernel.start(...args)
	}

	/**
	 * Shuts down the current application, if booted.
	 * This will notify all registered providers with a shutdown handler.
	 *
	 * @return {Promise}
	 */
	async shutdown() {
		if (!this.booted) {
			return
		}

		for (const provider of this.providers) {
			if (typeof provider.shutdown !== 'function') {
				continue
			}

			try {
				await provider.shutdown(this)
			} catch (e) {
				Log.error(`Error while shutting ${provider.name} down`, e)
			}
		}

		this.emit('shutdown', this)

		this.booted = false
	}

	// Pass through properties for the http kernel
	get errorHandler() {
		return (this as any).http.errorHandler
	}
}
