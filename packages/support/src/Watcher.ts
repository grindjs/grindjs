import chalk from 'chalk'
import path from 'path'

/**
 * Watcher wraps chokidar and clears require.cache
 * when watched files are changed
 */
export class Watcher {
	/**
	 * Array of paths to watch
	 * @type string
	 */
	paths: string[]

	/**
	 * Whether or not `restart` is being called
	 * @type bool
	 */
	restarting = false

	/**
	 * Callback for when changes are triggered
	 * @type function
	 */
	restart: (() => {}) | undefined = undefined

	/**
	 * Creates an instance of Watcher with an
	 * array of directories to watch
	 *
	 * @param  [string]  paths  Directories to watch
	 */
	constructor(paths: string | string[]) {
		if (typeof paths === 'string') {
			paths = [paths]
		}

		if (paths.length === 1 && Array.isArray(paths[0])) {
			paths = paths[0] as string[]
		}

		this.paths = paths
	}

	/**
	 * Starts watching the paths
	 * @return Promise
	 */
	async watch() {
		const watcher = await import('chokidar').then(chokidar => chokidar.watch(this.paths))

		await new Promise((resolve, reject) => {
			watcher.on('ready', (err: Error) => {
				if (err) {
					return reject(err)
				}

				return resolve()
			})
		})

		watcher.on('all', () => {
			if (this.restarting) {
				return
			}

			files: for (const file of Object.keys(require.cache)) {
				paths: for (const dir of this.paths) {
					if (file.indexOf(dir) !== 0) {
						continue paths
					}

					delete require.cache[file]
					continue files
				}
			}

			return this._restart()
		})

		console.log(
			chalk.yellow('Watching %s'),
			this.paths.map(dir => path.relative(process.cwd(), dir)),
		)

		return this._restart()
	}

	/**
	 * Calls `restart` and tracks `restarting` state
	 * @private
	 */
	private async _restart() {
		this.restarting = true
		await this.restart?.()
		this.restarting = false
	}
}
