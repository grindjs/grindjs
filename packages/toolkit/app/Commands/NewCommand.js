import { Command, InputArgument, InputOption, AbortError } from 'grind-cli'

import { FS } from 'grind-support'
import { execFile } from 'child_process'

const path = require('path')
const fetch = require('fetchit')

export class NewCommand extends Command {

	name = 'new'
	description = 'Create a new Grind application'
	arguments = [ 'name' ]

	arguments = [
		new InputArgument(
			'name',
			InputArgument.VALUE_OPTIONAL,
			'The name of the project to create'
		)
	]

	options = [
		new InputOption(
			'template',
			InputOption.VALUE_OPTIONAL,
			'API or Web.',
			'web'
		),
		new InputOption(
			'tag',
			InputOption.VALUE_OPTIONAL,
			'Repository tag to use, defaults to most recent tag.',
		),
		new InputOption(
			'skip-packages',
			InputOption.VALUE_NONE,
			'If present, packages will not be installed.'
		),
		new InputOption(
			'prefer-npm',
			InputOption.VALUE_NONE,
			'yarn will be used by default if it’s installed.  Pass this to use npm.'
		)
	]

	async run() {
		const type = this.option('template', 'web').trim().toLowerCase()
		const repository = `grindjs/example-${type}`
		const target = this.argument('name')

		if(type !== 'web' && type !== 'api') {
			throw new AbortError('Invalid template option, only web & api are supported.')
		}

		const exists = await FS.exists(target)

		if(exists) {
			throw new AbortError('Target directory already exists')
		}

		this.comment(`Creating a new Grind ${type} application.`)

		let tag = this.option('tag')

		if(tag.isNil) {
			this.comment('Finding latest tag')
			const tags = await fetch.json(`https://api.github.com/repos/${repository}/tags`, {
				headers: { 'User-Agent': 'grind/installer' }
			})

			const released = tags.filter(({ name }) => name.match(/^\d+\.\d+\.\d+$/))
			tag = (released.length > 0 ? released : tags)[0].name
		}

		await FS.mkdirs(target)

		this.comment(`Cloning ${repository}@${tag}`)
		await this.exec('git', [
			'clone',
			'--depth', '1',
			'--branch', tag,
			`https://github.com/${repository}.git`,
			target
		])

		process.chdir(target)

		const packageContents = await FS.readFile('package.json')
		const packageJson = JSON.parse(packageContents)
		packageJson.version = '0.0.1'
		packageJson.name = path.basename(target)

		await this.exec('rm', [ '-fr', '.git' ])
		await FS.writeFile('package.json', JSON.stringify(packageJson, null, '  '))

		if(!this.option('skip-packages')) {
			Log.comment('Installing Packages')

			const hasYarn = !this.option('prefer-npm') && await this.execFile('bash', [
				'type', 'yarn'
			]).then(() => true).catch(() => false)

			if(hasYarn) {
				await this.exec('yarn', [ 'install' ])
			} else {
				await this.exec('npm', [ 'install' ])
			}
		}

		this.comment('Done')
	}

	execFile(command, args) {
		return new Promise((resolve, reject) => {
			execFile(command, args, (err, stdout, stderr) => {
				if(err) {
					err.stdout = stdout
					err.stderr = stderr
					return reject(err)
				}

				resolve({
					stdout: stdout,
					stderr: stderr
				})
			})
		})
	}

	exec(command, args) {
		return this.execFile(command, args).catch(err => {
			this.error('Error:')
			this.error('-- %s', err.stderr.trim().replace(/\n/g, '\n-- '))
			process.exit(1)
		})
	}

	async modifyFile(pathname, callback) {
		const contents = await FS.readFile(pathname)
		await FS.writeFile(pathname, callback(contents))
	}

}
