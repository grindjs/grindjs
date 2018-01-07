const { promisify } = require('util')
const execFile = promisify(require('child_process').execFile)

export class Service {

	constructor(test, service, { image, port }) {
		this.service = service
		this.config = {
			image,
			port: {
				host: 43210 + port,
				container: port
			}
		}

		test.before(() => this.start())
		test.after.always(() => this.stop())
	}

	get port() {
		return this.config.port.host
	}

	async start() {
		Log.comment(`${this.service} starting`)
		const { image, port: { host, container } } = this.config

		// Clean up old containers
		await this.exec('rm', '--force', this._container, this._containerWait).catch(() => { })

		// Start the container
		await this.exec(
			'run',
			`--name=${this._container}`,
			'-d',
			'-p', `${host}:${container}`,
			image
		)

		// Wait for the container to become avaiable
		Log.comment(`${this.service} waiting`)
		await this.exec(
			'run',
			'--rm',
			`--name=${this._containerWait}`,
			`--link=grind-${this.service}:${this.service}`,
			'dadarek/wait-for-dependencies',
			`${this.service}:${container}`
		)
		Log.comment(`${this.service} started`)
	}

	async stop() {
		Log.comment(`${this.service} stopping`)
		await this.exec('stop', this._container).catch(() => { })
		await this.exec('rm', this._container).catch(() => { })
	}

	get _container() {
		return `grind-${this.service}`
	}

	get _containerWait() {
		return `grind-wait-for-${this.service}`
	}

	exec(...args) {
		return execFile('docker', args)
	}

}
