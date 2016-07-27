import fs from 'fs'
import cluster from 'cluster'

const RELOAD_EXIT_CODE = 99

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
		const port = process.env.NODE_PORT || app.config.get('app.port', 3000)

		const server = app.listen(port, () => {
			if(!worker.isNil) {
				process.title = process.cwd() + ` [server:${port}]`
				Log.comment('Worker %d listening on %d', worker.id, port)
			} else {
				process.title = process.cwd() + ` [cluster] [worker:${port}]`
				Log.comment('Listening on port %d', port)
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

		process.on('SIGUSR1', () => {
			if(worker.isNil) {
				Log.error('Only a clustered server can be reloaded via SIGUSR1')
				return
			}

			teardown(RELOAD_EXIT_CODE)
		})
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

			if(Number.parseInt(code) !== RELOAD_EXIT_CODE) {
				console.log('Worker %d died with code %s, signal %s, replacing', deadWorker.id, code, signal)
			} else {
				console.log('Reloading %s', deadWorker.id)
			}

			cluster.fork()
		})

		process.on('SIGUSR1', () => {
			Log.comment('Reloading workers')
			this.reloadWorkers(Object.assign({ }, cluster.workers))
		})
	}

	reloadWorkers(remainingWorkers) {
		const ids = Object.keys(remainingWorkers)
		if(ids.length === 0) {
			Log.comment('Finished reloading workers')
			return
		}

		const worker = remainingWorkers[ids[0]]
		delete remainingWorkers[ids[0]]

		worker.on('exit', () => this.reloadWorkers(remainingWorkers))
		worker.process.kill('SIGUSR1')
	}

}
