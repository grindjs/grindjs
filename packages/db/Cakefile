{exec} = require 'child_process'

task 'build', 'Build lib from src', ->
	exec 'mkdir -p lib', (err, stdout, stderr) ->
		throw new Error(err) if err

		exec "coffee --compile --bare --output lib/ src/", (err, stdout, stderr) ->
			throw new Error(err) if err

			exec "echo $'module.exports = require(\\'./lib/db\\');' > db.js", (err, stdout, stderr) ->
				throw new Error(err) if err
