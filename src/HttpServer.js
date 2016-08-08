import chalk from 'chalk'
import cluster from 'cluster'
import express from 'express'
import fs from 'fs'
import path from 'path'

export class HttpServer {

	bootstrapper = null
	pidFile = null

	constructor(bootstrapper) {
		this.bootstrapper = bootstrapper
	}

	start() {
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
			this.watch(watchDirs)
		} else if(clustered !== true) {
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

	watch(...dirs) {
		if(dirs.length === 1 && Array.isArray(dirs[0])) {
			dirs = dirs[0]
		}

		const chokidar = require('chokidar')
		const watcher = chokidar.watch(dirs)
		let server = null

		watcher.on('ready', () => {
			watcher.on('all', () => {
				files:
				for(const file of Object.keys(require.cache)) {
					dirs:
					for(const dir of dirs) {
						if(file.indexOf(dir) !== 0) {
							continue dirs
						}

						delete require.cache[file]
						continue files
					}
				}

				if(!server.isNil) {
					console.log(chalk.yellow('Restarting'))
					const oldServer = server
					server = null

					oldServer.destroy(() => {
						server = this._watchServe()
					})
				} else {
					server = this._watchServe()
				}
			})
		})

		console.log(chalk.yellow('Watching %s'), dirs.map(dir => path.relative(process.cwd(), dir)))
		server = this._watchServe()
	}

	_watchServe() {
		let server = null

		try {
			const app = this.bootstrapper()
			const port = app.port
			this.lastPort = port

			server = app.listen(port, () => {
				console.log(chalk.yellow('Listening on port %d'), port)
			})
		} catch(err) {
			const codeFrame = err.codeFrame
			delete err.codeFrame

			console.log(chalk.red('Failed to start'), err)
			this.lastPort = this.lastPort || process.env.NODE_PORT

			if(!this.lastPort.isNil) {
				const app = express()
				app.use((req, res) => {
					res.header('Content-Type', 'text/plain')

					if(!codeFrame.isNil) {
						res.send(`${err.message}\n${codeFrame.replace(/\[[0-9]+m/g, '')}`)
					} else {
						res.send(`${err.message}\n${err.stack}`)
					}
				})

				server = app.listen(this.lastPort)
			}
		}

		if(server.isNil) {
			return null
		}

		const connections = { }

		server.on('connection', connection => {
			const key = `${connection.remoteAddress}:${connection.remotePort}`
			connections[key] = connection
			connection.on('close', () => {
				delete connections[key]
			})
		})

		server.destroy = cb => {
			server.close(cb)

			for(const key of Object.keys(connections)) {
				connections[key].destroy()
			}
		}

		return server
	}

}
