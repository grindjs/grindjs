import { Command, InputArgument, InputOption, AbortError } from 'grind-cli'
import { FS } from 'grind-support'

const fetch = require('fetchit')
const path = require('path')
const { spawn } = require('child_process')

export class ProviderAddCommand extends Command {

	name = 'provider:add'
	description = 'Adds a provider to your Grind project'

	// Arguments available for this command
	arguments = [
		new InputArgument('provider', InputArgument.VALUE_REQUIRED, 'Name of the provider to add'),
	]

	// Options for this command
	options = [
		new InputOption('skip-config', InputOption.VALUE_NONE, 'If provided, config files will not be copied into your project.'),
	]

	async run() {
		if(!await FS.exists('package.json')) {
			throw new AbortError('Unable to find package.json, are you sure you’re in a Grind project directory?')
		}

		const name = await this.addPackage()

		const packagePath = this.app.paths.packages(name)
		const info = require(this.app.paths.packageInfo)
		const context = info.grind || { }
		const providers = await this.findProviders(name, packagePath, info, context)

		if(providers.isNil) {
			throw new AbortError(`Unable to find provider for ${name}.`)
		}

		const importLine = `import { ${providers.join(', ')} } from '${name}'`
		const addLines = providers.map(provider => `app.providers.add(${provider})`)

		await this.copyConfig(context, packagePath)

		try {
			await this.injectProviders(name, providers, context, importLine, addLines)
		} catch(err) {
			return this.failWithInstructions(err.message, context, importLine, addLines)
		}

		await this.outputProviderMessage(context)

		return this.success(`${name} should now be setup and ready to use.`)
	}

	async failWithInstructions(message, context, importLine, addLines) {
		this.output.writeError(new AbortError(message))
		this.comment('To finish the setup, add the following line towards the top of your Bootstrap file:')
		this.info('')
		this.info(`\t${importLine}`)
		this.info('')
		this.comment(`And add the following line${addLines.length === 1 ? '' : 's'} after you’ve created your Grind instance:`)
		this.info('')
		this.info(`\t${addLines.join('\n\t')}`)
		this.info('')
		await this.outputProviderMessage(context)

		return process.exit(1)
	}

	async addPackage() {
		let [ name, version ] = this.argument('provider').split(/@/) // eslint-disable-line prefer-const
		let exists = false

		if(!name.startsWith('grind-') && await this.packageExists(`grind-${name}`)) {
			name = `grind-${name}`
			exists = true
		} else {
			exists = this.packageExists(name)
		}

		if(!exists) {
			throw new AbortError(`Unable to find ${name}.`)
		}

		const packageName = version.isNil ? name : `${name}@${version}`

		if(await FS.exists('yarn.lock')) {
			await this.exec('yarn', [ 'add', packageName ])
		} else {
			await this.exec('npm', [ 'install', '--save', packageName ])
		}

		return name
	}

	async packageExists(name) {
		return fetch(`https://www.npmjs.com/package/${encodeURIComponent(name)}`, {
			method: 'HEAD'
		}).then(() => true).catch(() => false)
	}

	async copyConfig({ config }, packagePath) {
		if(this.containsOption('skip-config')) {
			return
		}

		if(config === false) {
			return
		}

		if(config.isNil) {
			config = path.join(packagePath, 'config')
		} else {
			config = path.join(packagePath, config)
		}

		if(!(await FS.exists(config))) {
			return
		}

		const configDir = this.app.paths.project('config')

		if(!await FS.stat(config).then(stats => stats.isDirectory())) {
			return this.copyConfigFile(config, path.join(configDir, path.basename(config)))
		}

		for(const file of await FS.recursiveReaddir(config)) {
			await this.copyConfigFile(
				file,
				path.join(configDir, path.relative(config, file))
			)
		}
	}

	async injectProviders(name, providers, context, importLine, addLines) {
		if(!await FS.exists(this.app.paths.bootstrap)) {
			return this.failWithInstructions('Unable to find app/Bootstrap.js', context, importLine, addLines)
		}

		let bootstrap = (await FS.readFile(this.app.paths.bootstrap)).toString()
		let nameConflict = bootstrap.includes(name)

		if(!nameConflict) {
			for(const provider of providers) {
				if(!bootstrap.includes(provider)) {
					continue
				}

				nameConflict = true
				break
			}
		}

		if(nameConflict) {
			throw new Error('This package has already been detected in the bootstrap file.')
		}

		const importIndex = [
			bootstrap.lastIndexOf('import {'),
			bootstrap.lastIndexOf('import '),
			bootstrap.lastIndexOf('require(')
		].find(index => index >= 0)

		if(importIndex >= 0) {
			const nextLine = bootstrap.indexOf('\n', importIndex)
			bootstrap = `${bootstrap.substring(0, nextLine)}\n${importLine}${bootstrap.substring(nextLine)}`
		} else {
			throw new Error('Irregular app/Bootstrap.js detected.')
		}

		const providersAddIndex = [
			bootstrap.lastIndexOf('providers.add'),
			bootstrap.lastIndexOf('app.providers'),
			bootstrap.lastIndexOf('const app =')
		].find(index => index >= 0)

		if(!providersAddIndex.isNil) {
			const nextLine = bootstrap.indexOf('\n', providersAddIndex)
			bootstrap = `${bootstrap.substring(0, nextLine)}\n${addLines.join('\n')}${bootstrap.substring(nextLine)}`
		} else {
			throw new Error('Irregular app/Bootstrap.js detected.')
		}

		return FS.writeFile(this.app.paths.bootstrap, bootstrap)
	}

	async copyConfigFile(source, destination) {
		if(await FS.exists(destination)) {
			return
		}

		Log.comment(`Adding config file ${path.relative(this.app.paths.project(), destination)}`)

		await FS.mkdirp(path.dirname(destination))
		return FS.writeFile(destination, await FS.readFile(source))
	}

	outputProviderMessage({ message }) {
		if(message.isNil) {
			return
		}

		this.comment('Provider message:')
		this.info('')
		this.info(`\t${message}`)
		this.info('')
	}

	async findProviders(name, packagePath, info, context) {
		if(!context.provider.isNil) {
			return context.provider
		}

		const dir = path.dirname(require.resolve(path.join(packagePath)))
		const files = (await FS.recursiveReaddir(dir)).filter(file => path.basename(file).includes('Provider.'))
		const providers = Array.from(new Set(files.map(file => path.basename(file, path.extname(file)))))

		if(providers.length === 0) {
			return null
		}

		return providers
	}

	exec(file, args, options = { }) {
		const child = spawn(file, args, { stdio: 'inherit', ...options })
		return new Promise((resolve, reject) => {
			child.on('exit', code => {
				if(Number(code) !== 0) {
					return reject(new Error(`Process exited with ${code}`))
				}

				return resolve()
			})
		})
	}

}
