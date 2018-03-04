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

module.exports = app
