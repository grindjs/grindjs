let cluster = require('cluster')

if(cluster.isMaster) {
	const cpuCount = require('os').cpus().length

    for(var i = 0; i < cpuCount; i += 1) {
		cluster.fork()
	}

	cluster.on('exit', (worker) => {
		console.log('Worker %d died, replacing', worker.id)
		cluster.fork()
	})
} else {
	const app = require('App/Boot')
	const port = app.config.get('app.port', 3000)

	app.listen(port, () => {
		console.log('Worker %d listening on %d', cluster.worker.id, port)
	})
}
