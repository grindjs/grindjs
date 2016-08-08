import fs from 'fs'
import cluster from 'cluster'
import chalk from 'chalk'

export class HttpServer {

	bootstrapper = null
	pidFile = null

	constructor(bootstrapper) {
		this.bootstrapper = bootstrapper
	}

	start() {
		let clustered = false

		for(const arg of process.argv) {
			if(arg === '--cluster') {
				clustered = true
			} else if(arg.startsWith('--pid=') && cluster.isMaster) {
				this.pidFile = arg.substr(6)
			}
		}

		if(!this.pidFile.isNil) {
			// eslint-disable-next-line no-sync,no-empty
			try { fs.writeFileSync(this.pidFile, process.pid) } catch(err) { }
		}

		if(clustered !== true) {
			this.serve()
		} else {
			this.cluster()
		}
	}

	serve(worker = null) {
		const app = this.bootstrapper()
		const port = app.port

		const server = app.listen(port, () => {
			if(!worker.isNil) {
				process.title = process.cwd() + ` [server:${port}]`
				console.log(chalk.yellow('Worker %d listening on %d'), worker.id, port)
			} else {
				process.title = process.cwd() + ` [cluster] [worker:${port}]`
				console.log(chalk.yellow('Listening on port %d'), port)
			}
		})

		const teardown = (exitCode) => {
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
	}

	cluster() {
		if(!cluster.isMaster) {
			return this.serve(cluster.worker)
		}

		process.title = process.cwd() + ' [cluster] [master]'

		const cpuCount = require('os').cpus().length
		for(let i = 0; i < cpuCount; i += 1) {
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

}
