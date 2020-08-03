#!/usr/bin/env node
/* eslint-disable no-sync */

const { execFileSync } = require('child_process')
const fs = require('fs')
const chalk = require('chalk')
const path = require('path')
function log(msg, ...args) {
	console.log(chalk.yellow(msg), ...args)
}

log('Cleaning up any previous builds')
require('rimraf').sync('build')

log('Building')
for (const [input, output] of Object.entries({
	app: 'build/app',
	boot: 'build/boot',
})) {
	fs.mkdirSync(output, { recursive: true })
	execFileSync('node', [
		require.resolve('@babel/cli/lib/babel'),
		'--copy-files',
		'--source-maps',
		'inline',
		'--out-dir',
		output,
		input,
	])
}

log('Setting up cli bin')
const cliBin = 'build/cli'
fs.copyFileSync(path.join(__dirname, 'boot.js'), cliBin)
let content = fs.readFileSync(cliBin).toString()
content = content.replace(/appRoot\s*=\s*process\.cwd\(\)/g, "appRoot = path.join(__dirname, '..')")
content = content.replace(/bootDir = 'boot'/g, "bootDir = 'build/boot'")
fs.writeFileSync(cliBin, content)

log('Finalizing boot files')
for (const file of ['build/boot/Cli.js', 'build/boot/Http.js']) {
	let content = fs.readFileSync(file).toString()
	content = content.replace(/require\('@babel\/register'\)/g, '')
	fs.writeFileSync(file, content)
}

log('Finished')
