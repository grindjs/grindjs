import './AssetFactory'

import './Commands/PublishCommand'
import './Commands/UnpublishCommand'

import './Compilers/BabelCompiler'
import './Compilers/CssCompiler'
import './Compilers/JavascriptCompiler'
import './Compilers/RawCompiler'
import './Compilers/ScssCompiler'
import './Compilers/SvgCompiler'

import './Controllers/CompileController'

import './View/AssetContainer'
import './View/AssetExtension'

import path from 'path'

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

	const autoMinify = typeof config.auto_minify === 'boolean' ? config.auto_minify : !app.debug
	const factory = new AssetFactory(app, autoMinify)
	app.assets = factory

	factory.registerCompiler(BabelCompiler)
	factory.registerCompiler(CssCompiler)
	factory.registerCompiler(JavascriptCompiler)
	factory.registerCompiler(RawCompiler)
	factory.registerCompiler(ScssCompiler)
	factory.registerCompiler(SvgCompiler)

	app.routes.group({ prefix: 'assets', controller: new CompileController(app, factory) }, routes => {
		routes.get(':type/:a?/:b?/:c?/:d?/:e?', 'compile')
	})

	const dirs = new Set()
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

	if(!app.view.isNil) {
		if(!app.html.isNil) {
			const assetExtensionClass = parameters.assetExtensionClass || AssetExtension
			app.view.addExtension('AssetExtension', new assetExtensionClass)
		}

		const assetContainerClass = parameters.assetContainerClass || AssetContainer

		app.routes.use((req, res, next) => {
			res.locals.assetPath = (path, secure) => factory.publishedPath(path, req, secure)

			if(!res.locals.html.isNil) {
				res.locals._assetContainer = new assetContainerClass(req, res, factory, res.locals.html)
			}

			next()
		})
	}
}

AssetsProvider.priority = 10000
