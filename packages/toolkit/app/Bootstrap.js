import './Extensions/Paths'

import { Application } from '@grindjs/framework'

const fs = require('fs')

export function Bootstrap(kernelClass) {
	const app = new Application(kernelClass, {
		pathsClass: Paths,
	})

	try {
		fs.statSync(app.paths.packageInfo) // eslint-disable-line no-sync
		app.inProject = true
	} catch (err) {
		app.inProject = false
	}

	if (app.inProject) {
		app.providers.add(require('@grindjs/view').ViewProvider)
		app.providers.add(require('./Providers/DetectPackagesProvider').DetectPackagesProvider)
		app.providers.add(require('./Providers/PackageCommandsProvider').PackageCommandsProvider)
		app.providers.add(require('./Providers/PackageViewsProvider').PackageViewsProvider)
		app.providers.add(require('./Providers/StubGeneratorProvider').StubGeneratorProvider)
	}

	return app
}
