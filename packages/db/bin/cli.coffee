{exec} = require 'child_process'
path = require 'path'
fs = require 'fs'

process.argv.shift()
process.argv[0] = ''
process.argv[1] = ''

run = (bin) ->
	unless bin.length > 0
		console.error 'Could not find knex bin.'
		return

	if process.argv.length > 2
		switch process.argv[2]
			when 'init', 'migrate:make', 'seed:make'
				process.argv.push '-x', 'coffee'

	require bin

# Look for bin locally
cli = 'knex/src/bin/cli.js'
candidates = [
	path.join(process.cwd(), 'node_modules', cli),
	path.join(__dirname, '..', cli),
	path.join(__dirname, '../..', cli),
	path.join(__dirname, '../../node_modules', cli),
	path.join(__dirname, '../node_modules', cli),
	path.join(__dirname, 'node_modules/', cli)
]

exists = (path) ->
	try
		fs.accessSync path, fs.F_OK
		return true
	catch e
		return false

for candidate in candidates
	unless exists(candidate)
		continue

	run candidate
	return

# Check in path
exec '/usr/bin/env which knex', (err, stdout, stderr) ->
	run (stdout or '').trim()
