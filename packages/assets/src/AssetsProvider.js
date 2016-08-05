import './AssetFactory'
import './Http/Controller'

import './Compilers/ScssCompiler'

import path from 'path'

export function AssetsProvider(app) {
	app.config.loadDefault('assets', path.join(__dirname, '../config/assets.json'))

	const factory = new AssetFactory(app)
	factory.registerCompiler(new ScssCompiler(app))

	app.routes.group({ prefix: 'assets', controller: new Controller(app, factory) }, routes => {
		routes.get('img/:a?/:b?/:c?/:d?/:e?', 'img')
		routes.get('font/:a?/:b?/:c?/:d?/:e?', 'font')
		routes.get('css/:a?/:b?/:c?/:d?/:e?', 'css')
		routes.get(':type/:a?/:b?/:c?/:d?/:e?', 'compile')
	})

}
