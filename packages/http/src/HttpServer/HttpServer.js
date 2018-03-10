const chalk = require('chalk')
const cluster = require('cluster')
const fs = require('fs')
const path = require('path')

export class HttpServer {

	bootstrapper = null
	pidFile = null

	constructor(bootstrapper) {
		this.bootstrapper = bootstrapper
	}

	async start() {
		let clustered = false
		let watchDirs = null

		for(const arg of process.argv) {
			if(arg === '--cluster') {
				clustered = true
			} else if(arg.startsWith('--cluster=')) {
				clustered = Number.parseInt(arg.substr(10))
			} else if(arg.startsWith('--watch=')) {
				watchDirs = [ ]

				for(const dir of arg.substr(8).split(',')) {
					if(dir.substring(0, 1) === '/') {
						watchDirs.push(dir)
					} else {
						watchDirs.push(path.join(process.cwd(), dir))
					}
				}
			} else if(arg.startsWith('--pid=') && cluster.isMaster) {
				this.pidFile = arg.substr(6)
			}
		}

		if(!this.pidFile.isNil) {
			// eslint-disable-next-line no-sync,no-empty
			try { fs.writeFileSync(this.pidFile, process.pid) } catch(err) { }
		}

		if(clustered && !watchDirs.isNil) {
			console.log('--watch and --cluster can not be used together')
			process.exit(1)
		}

		if(!watchDirs.isNil) {
			await this.watch(watchDirs)
		} else if(clustered === false) {
			await this.serve()
		} else {
			await this.cluster(clustered)
		}
	}

	async serve(worker = null) {
		const app = this.bootstrapper()
		const port = app.port

		const server = await app.start(port, () => {
			if(!worker.isNil) {
				process.title = `${process.cwd()} [server:${port}]`
				console.log(chalk.yellow('Worker %d listening on %d'), worker.id, port)
			} else {
				process.title = `${process.cwd()} [cluster] [worker:${port}]`
				console.log(chalk.yellow('Listening on port %d'), port)
			}
		})

		const teardown = exitCode => {
			const exit = () => {
				if(!this.pidFile.isNil) {
					// eslint-disable-next-line no-sync,no-empty
					try { fs.unlinkSync(this.pidFile) } catch(err) { }
				}

				process.exit(exitCode)
			}

			// Attempt a safe teardown
			server.close(exit)

			// After 10s, kill
			setTimeout(exit, 10000)
		}

		process.on('SIGTERM', () => teardown(0))
		process.on('SIGINT', () => teardown(0))

		return server
	}

	cluster(workers = null) {
		if(!cluster.isMaster) {
			return this.serve(cluster.worker)
		}

		if(!process.env.NODE_CLUSTER.isNil) {
			workers = Number.parseInt(process.env.NODE_CLUSTER)
		}

		if(workers.isNil || Number.isNaN(workers) || workers <= 0) {
			workers = require('os').cpus().length
		}

		process.title = `${process.cwd()} [cluster] [master]`

		for(let i = 0; i < workers; i += 1) {
			cluster.fork()
		}

		cluster.on('exit', (deadWorker, code, signal) => {
			if(signal === 'SIGTERM' || signal === 'SIGINT') {
				return
			}

			console.log('Reloading %s', deadWorker.id)
			cluster.fork()
		})
	}

	watch(...dirs) {
		const Watcher = require('./HttpServer/Watcher.js').Watcher
		return (new Watcher(this, dirs)).watch()
	}

}
