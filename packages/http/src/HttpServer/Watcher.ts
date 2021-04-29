import http from 'http'
import { Socket } from 'net'
import path from 'path'

import { MissingPackageError } from '@grindjs/framework'
import chalk from 'chalk'
import express from 'express'

type WatcherServer = http.Server & {
	destroy(callback?: (error?: Error) => void): void
}

export class Watcher {
	lastPort: number | null = null
	dirs: string[]
	server: WatcherServer | null = null
	restarting = false

	constructor(public httpServer: import('./HttpServer').HttpServer, dirs: string[]) {
		if (dirs.length === 1 && Array.isArray(dirs[0])) {
			this.dirs = dirs[0]
		} else {
			this.dirs = dirs
		}
	}

	async watch() {
		let chokidar = null

		try {
			chokidar = await import('chokidar')
		} catch (err) {
			throw new MissingPackageError(
				'chokidar',
				'dev',
				'`chokidar` is required to monitor file changes in your app.',
			)
		}

		const watcher = chokidar.watch(this.dirs)

		watcher.on('ready', () => {
			watcher.on('all', async () => {
				if (this.restarting) {
					return
				}

				files: for (const file of Object.keys(require.cache)) {
					dirs: for (const dir of this.dirs) {
						if (file.indexOf(dir) !== 0) {
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
			if (!this.server) {
				process.exit(0)
				return
			}

			const exit = () => process.exit(0)

			// Attempt a safe teardown
			this.server?.destroy(exit)

			// After 1s, kill
			setTimeout(exit, 1000)
		}

		process.on('SIGTERM', teardown)
		process.on('SIGINT', teardown)

		console.log(
			chalk.yellow('Watching %s'),
			this.dirs.map(dir => path.relative(process.cwd(), dir)),
		)
		await this.restart()
	}

	async restart() {
		this.restarting = true

		if (this.server) {
			console.log(chalk.yellow('Restarting'))
			const oldServer = this.server
			this.server = null

			await oldServer.destroy()
		}

		this.server = await this.serve()
		this.restarting = false
	}

	async serve() {
		let server: WatcherServer | undefined = undefined

		try {
			const app = this.httpServer.bootstrapper()
			const port = app.port
			this.lastPort = port ?? null

			server = (await app.start(port, () => {
				console.log(chalk.yellow('Listening on port %d'), port)
			})) as any

			server?.on('close', () => app.shutdown())
		} catch (err) {
			const codeFrame = err.codeFrame
			delete err.codeFrame

			console.log(chalk.red('Failed to start'), err)
			this.lastPort = this.lastPort || Number(process.env.NODE_PORT)

			if (!this.lastPort) {
				const app = express()
				app.use((req, res) => {
					res.header('Content-Type', 'text/plain')

					if (!codeFrame.isNil) {
						res.send(`${err.message}\n${codeFrame.replace(/\[[0-9]+m/g, '')}`)
					} else {
						res.send(`${err.message}\n${err.stack}`)
					}
				})

				server = (await app.listen(this.lastPort)) as any
			}
		}

		if (!server) {
			return null
		}

		const connections: Record<string, Socket> = {}

		server.on('connection', connection => {
			const key = `${connection.remoteAddress}:${connection.remotePort}`
			connections[key] = connection
			connection.on('close', () => {
				delete connections[key]
			})
		})

		server.destroy = (callback?: (error?: Error) => void) => {
			server!.close(callback)

			for (const key of Object.keys(connections)) {
				connections[key].destroy()
			}
		}

		return server
	}
}
