import './HttpServer/Watcher'

import chalk from 'chalk'
import cluster from 'cluster'
import fs from 'fs'
import path from 'path'

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
		} else if(clustered !== true) {
			await this.serve()
		} else {
			await this.cluster()
		}
	}

	async serve(worker = null) {
		const app = this.bootstrapper()
		const port = app.port

		const server = await app.listen(port, () => {
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

	cluster() {
		if(!cluster.isMaster) {
			return this.serve(cluster.worker)
		}

		process.title = `${process.cwd()} [cluster] [master]`

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

	watch(...dirs) {
		return (new Watcher(this, dirs)).watch()
	}

}