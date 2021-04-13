#!/usr/bin/env node
/* eslint-disable no-sync */

const path = require('path')
const { existsSync } = require('fs')
const appRoot = process.cwd()
const bootDir = 'boot'

if (!existsSync(path.join(appRoot, 'package.json'))) {
	process.stderr.write('Could not find root path.\n')
	process.exit(1)
} else if (!existsSync(path.join(appRoot, bootDir))) {
	process.stderr.write('Could not find boot directory.\n')
	process.exit(1)
}

const hasHttp = existsSync(path.join(appRoot, bootDir, 'Http.js'))
const command = process.argv[2]
let bootFile = null

if (hasHttp && (command === 'watch' || command === 'serve') && !process.argv.includes('--help')) {
	bootFile = 'Http.js'

	if (command === 'watch') {
		process.argv.push('--watch=app,config')
	}
} else {
	bootFile = 'Cli.js'
	process.env.IN_CLI = 'true'
	process.env.CLI_BIN = process.argv[1]
}

process.env.BASE_PATH = appRoot
process.env.APP_BASE = appRoot
process.env.WORKING_DIR = process.cwd()
require(path.join(appRoot, bootDir, bootFile))
