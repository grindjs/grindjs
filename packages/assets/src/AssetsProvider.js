import './AssetFactory'

import './Commands/PublishCommand'
import './Commands/UnpublishCommand'

import './Compilers/BabelCompiler'
import './Compilers/RawCompiler'
import './Compilers/ScssCompiler'

import './PostProcessors/CssAutoprefixerPostProcessor'
import './PostProcessors/CssMinifyPostProcessor'
import './PostProcessors/JavascriptMinifyPostProcessor'
import './PostProcessors/SvgOptimizePostProcessor'

import './Controllers/CompileController'

import './View/AssetContainer'
import './View/NunjucksExtension'
import './View/StoneExtension'

const path = require('path')

function expandMacros(config, macros) {
	const isArray = Array.isArray(config)
	let reindex = false

	for(const key of Object.keys(config)) {
		const value = config[key]

		if(typeof value === 'object' && value !== null) {
			config[key] = expandMacros(value, macros)
			continue
		} else if(typeof value !== 'string') {
			continue
		}

		for(const macro of macros) {
			const pattern = macro[0]
			const replacement = macro[1]

			if(!replacement.isNil) {
				config[key] = value.replace(pattern, replacement)
			} else if(value.match(pattern)) {
				reindex = isArray
				delete config[key]
			}
		}
	}

	if(reindex) {
		config = Array.from(config).filter(value => value.isNil === false)
	}

	return config
}

export function AssetsProvider(app, parameters = { }) {
	app.config.loadDefault('assets', path.join(__dirname, '../config/assets.json'))
	let config = Object.assign({ }, app.config.get('assets'))

	const macros = [
		[ 'node_modules', config.node_modules || app.paths.base('node_modules') ]
	]

	for(const macro of macros) {
		macro[0] = new RegExp(`\\{\\{\\s*${macro[0]}\\s*\\}\\}`, 'g')
	}

	config = expandMacros(config, macros)
	app.config.set('assets', config)

	const shouldOptimize = typeof config.should_optimize === 'boolean' ? config.should_optimize : !app.debug
	const liveReload = config.live_reload === true
	const sourceMaps = config.source_maps === 'auto' ? 'auto' : false
	const factory = new AssetFactory(app, shouldOptimize, sourceMaps, liveReload)
	app.assets = factory

	factory.registerCompiler(BabelCompiler)
	factory.registerCompiler(RawCompiler)
	factory.registerCompiler(ScssCompiler)

	factory.registerPostProcessor(CssAutoprefixerPostProcessor)
	factory.registerPostProcessor(CssMinifyPostProcessor)
	factory.registerPostProcessor(JavascriptMinifyPostProcessor)
	factory.registerPostProcessor(SvgOptimizePostProcessor)

	app.assets.controller = new CompileController(app, factory)

	app.routes.group({ prefix: 'assets', controller: app.assets.controller }, routes => {
		routes.get(':type/:a?/:b?/:c?/:d?/:e?', 'compile')
	})

	const dirs = new Set
	const published = app.config.get('assets-published', { })
	for(const src of Object.keys(published)) {
		dirs.add(published[src].replace(/^\//, '').split(/\//)[0])
	}

	for(const dir of dirs) {
		app.routes.static(dir, dir, {
			lastModified: true,
			maxAge: 864000000
		})
	}

	if(!app.cli.isNil) {
		app.cli.register(PublishCommand)
		app.cli.register(UnpublishCommand)
	}

	let hasAssetContainer = false

	if(!app.view.isNil) {
		if(!app.html.isNil) {
			if(app.view.engineName === 'nunjucks') {
				const nunjucksExtensionClass = parameters.nunjucksExtensionClass || NunjucksExtension
				app.view.extend('AssetExtension', new nunjucksExtensionClass)
			} else if(app.view.engineName === 'stone') {
				const stoneExtensionClass = parameters.stoneExtensionClass || StoneExtension
				stoneExtensionClass.extend(app.view)
			} else {
				Log.error('WARNING: Unsupported view engine, assets can not extend.')
			}
		}

		const assetContainerClass = parameters.assetContainerClass || AssetContainer
		hasAssetContainer = true

		app.routes.use((req, res, next) => {
			res.locals.assetPath = (path, secure) => factory.publishedPath(path, req, secure)

			if(!res.locals.html.isNil) {
				res.locals._assetContainer = new assetContainerClass(req, res, factory, res.locals.html)
			}

			next()
		})
	}

	if(liveReload) {
		if(!hasAssetContainer) {
			throw new Error('grind-asset’s live reload functionality must be used with grind-view and grind-html')
		}

		require('./LiveReload/LiveReloadProvider').LiveReloadProvider(app)
	}
}

AssetsProvider.priority = 10000
