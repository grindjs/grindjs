cluster = require('cluster')

if cluster.isMaster
	cpuCount = require('os').cpus().length

	for _ in [0..cpuCount]
		cluster.fork()

	cluster.on 'exit', (worker) ->
		console.log 'Worker %d died, replacing', worker.id
		cluster.fork()
		return

else
	app = require './boot'
	port = app.config.get 'app.port', 3000

	app.listen port, ->
		console.log 'Worker %d listening on %d', cluster.worker.id, port
	return
