import './DetectPackagesProvider'

import { FS } from 'grind-support'
const path = require('path')

export async function PackageViewsProvider(app) {
	for(const pkg of app.packages) {
		let views = null

		if(!pkg.config.views.isNil) {
			views = path.join(pkg.path, pkg.config.views)

			if(!await FS.exists(views)) {
				return
			}
		} else if(await FS.exists(path.join(pkg.path, 'views'))) {
			views = path.join(pkg.path, 'views')
		} else if(await FS.exists(path.join(pkg.path, 'stubs'))) {
			views = path.join(pkg.path, 'stubs')
		} else {
			return
		}

		app.view.engine.namespace(pkg.name, views)
	}
}

PackageViewsProvider.priority = DetectPackagesProvider.priority - 1
