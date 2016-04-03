{exec} = require 'child_process'

build = (callback = null) ->
	exec 'mkdir -p app-compiled', (err, stdout, stderr) ->
		throw new Error(err) if err

		exec "coffee --compile --bare --output app-compiled/ app/", (err, stdout, stderr) ->
			throw new Error(err) if err
			callback?()

task 'build', 'Build lib from src', ->
	build()

