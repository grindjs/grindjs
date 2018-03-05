import Grind from 'grind-framework'

import './Extensions/Paths'

const fs = require('fs')

const app = new Grind({
	pathsClass: Paths
})

try {
	fs.statSync(app.paths.packageInfo) // eslint-disable-line no-sync
	app.inProject = true
} catch(err) {
	app.inProject = false
}

if(app.inProject) {
	app.providers.add(require('grind-view').ViewProvider)
	app.providers.add(require('./Providers/DetectPackagesProvider').DetectPackagesProvider)
	app.providers.add(require('./Providers/PackageCommandsProvider').PackageCommandsProvider)
	app.providers.add(require('./Providers/PackageViewsProvider').PackageViewsProvider)
}

module.exports = app
