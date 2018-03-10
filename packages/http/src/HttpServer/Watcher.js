import '../Errors/MissingPackageError'

const chalk = require('chalk')
const express = require('express/lib/express.js')
const path = require('path')

export class Watcher {

	httpServer = null
	lastPort = null
	dirs = null
	server = null
	restarting = false

	constructor(httpServer, dirs) {
		this.httpServer = httpServer

		if(dirs.length === 1 && Array.isArray(dirs[0])) {
			dirs = dirs[0]
		}

		this.dirs = dirs
	}

	async watch() {
		let chokidar = null

		try {
			chokidar = require('chokidar')
		} catch(err) {
			throw new MissingPackageError(
				'chokidar', 'dev',
				'`chokidar` is required to monitor file changes in your app.'
			)
		}

		const watcher = chokidar.watch(this.dirs)

		watcher.on('ready', () => {
			watcher.on('all', async () => {
				if(this.restarting) {
					return
				}

				files:
				for(const file of Object.keys(require.cache)) {
					dirs:
					for(const dir of this.dirs) {
						if(file.indexOf(dir) !== 0) {
							continue dirs
						}

						delete require.cache[file]
						continue files
					}
				}

				await this.restart()
			})
		})

		const teardown = () => {
			if(this.server.isNil) {
				process.exit(0)
				return
			}

			const exit = () => process.exit(0)

			// Attempt a safe teardown
			this.server.destroy(exit)

			// After 1s, kill
			setTimeout(exit, 1000)
		}

		process.on('SIGTERM', teardown)
		process.on('SIGINT', teardown)

		console.log(chalk.yellow('Watching %s'), this.dirs.map(dir => path.relative(process.cwd(), dir)))
		await this.restart()
	}

	async restart() {
		this.restarting = true

		if(!this.server.isNil) {
			console.log(chalk.yellow('Restarting'))
			const oldServer = this.server
			this.server = null

			await oldServer.destroy()
		}

		this.server = await this.serve()
		this.restarting = false
	}

	async serve() {
		let server = null

		try {
			const app = this.httpServer.bootstrapper()
			const port = app.port
			this.lastPort = port

			server = await app.start(port, () => {
				console.log(chalk.yellow('Listening on port %d'), port)
			})

			server.on('close', () => app.shutdown())
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

				server = await app.listen(this.lastPort)
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
