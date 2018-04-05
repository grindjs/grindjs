const { promisify } = require('util')
const execFile = promisify(require('child_process').execFile)
const chalk = require('chalk')

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
		this.log(`${this.service} starting`)
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
		this.log(`${this.service} waiting`)
		await this.exec(
			'run',
			'--rm',
			`--name=${this._containerWait}`,
			`--link=grind-${this.service}:${this.service}`,
			'dadarek/wait-for-dependencies',
			`${this.service}:${container}`
		)
		this.log(`${this.service} started`)
	}

	async stop() {
		this.log(`${this.service} stopping`)
		await this.exec('stop', this._container).catch(() => { })
		await this.exec('rm', this._container).catch(() => { })
	}

	forceKill() {
		this.log(`${this.service} force killing`)
		return this.exec('exec', this._container, 'bash', '-c', 'kill -9 -1').catch(() => { })
	}

	get _container() {
		return `grind-${this.service}`
	}

	get _containerWait() {
		return `grind-wait-for-${this.service}`
	}

	log(msg, ...args) {
		Log.info(chalk.gray(msg), ...args)
	}

	exec(...args) {
		return execFile('docker', args)
	}

}
