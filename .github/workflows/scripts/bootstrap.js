#!/usr/bin/env node
const path = require('path')
const fs = require('fs')
const log = require('./utils/log')
const { execFileSync } = require('child_process')
const rootdir = path.join(__dirname, '../../..')
const package = require(path.join(rootdir, 'package.json'))
const { lerna } = package.devDependencies

if (!lerna) {
	throw new Error('Could not find lerna version')
}

// Run lerna bootstrap through npx to avoid a double yarn install
log.info('lerna bootstrap')
execFileSync('npx', [`lerna@${lerna}`, 'bootstrap'], {
	stdio: 'inherit',
})

// Workaround for issue where Lerna will sometimes not establish links
const scriptsdir = path.join(rootdir, 'packages/scripts')
const bindir = path.join(rootdir, 'node_modules/.bin')
const { bin } = require(path.join(scriptsdir, 'package.json'))
for (const [name, target] of Object.entries(bin)) {
	const binpath = path.join(bindir, name)
	if (fs.existsSync(binpath)) {
		continue
	}

	log.info(`linking ${name}`)
	fs.symlinkSync(path.relative(bindir, path.join(scriptsdir, target)), binpath)
}
