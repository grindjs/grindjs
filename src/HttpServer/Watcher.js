import chalk from 'chalk'
import express from 'express'
import path from 'path'

export class Watcher {
	httpServer = null
	lastPort = null
	dirs = null

	constructor(httpServer, dirs) {
		this.httpServer = httpServer

		if(dirs.length === 1 && Array.isArray(dirs[0])) {
			dirs = dirs[0]
		}

		this.dirs = dirs
	}

	async watch() {
		const chokidar = require('chokidar')
		const watcher = chokidar.watch(this.dirs)
		let server = null

		watcher.on('ready', () => {
			watcher.on('all', async () => {
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

				if(!server.isNil) {
					console.log(chalk.yellow('Restarting'))
					const oldServer = server
					server = null

					oldServer.destroy(async () => {
						server = await this.serve()
					})
				} else {
					server = await this.serve()
				}
			})
		})

		console.log(chalk.yellow('Watching %s'), this.dirs.map(dir => path.relative(process.cwd(), dir)))
		server = await this.serve()
	}

	async serve() {
		let server = null

		try {
			const app = this.httpServer.bootstrapper()
			const port = app.port
			this.lastPort = port

			server = await app.listen(port, () => {
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
