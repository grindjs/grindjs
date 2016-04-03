{exec} = require 'child_process'

task 'build', 'Build lib from src', ->
	exec 'mkdir -p lib', (err, stdout, stderr) ->
		throw new Error(err) if err

		exec "coffee --compile --bare --map --output lib/ src/", (err, stdout, stderr) ->
			throw new Error(err) if err
