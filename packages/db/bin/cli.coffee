{exec} = require 'child_process'

process.argv.shift()
process.argv[0] = ''
process.argv[1] = ''

exec '/usr/bin/env which knex', (err, stdout, stderr) ->
	bin = (stdout or '').trim()

	unless bin.length > 0
		console.error 'Could not find knex bin.'
		return

	if process.argv.length > 2
		switch process.argv[2]
			when 'init', 'migrate:make', 'seed:make'
				process.argv.push '-x', 'coffee'

	require bin
