import { Command, InputArgument, InputOption } from 'grind-cli'
import { execFile } from 'child-process-promise'

import { FS } from 'grind-support'
import path from 'path'
import request from 'request-promise-native'

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
			'type',
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
			'skip-npm',
			InputOption.VALUE_NONE,
			'If present, will not run npm install.'
		)
	]

	async run() {
		const type = this.option('type', 'web').toLowerCase()
		const repository = `grindjs/example-${type}`
		const target = this.argument('name')
		const skipNpm = process.argv.indexOf('--skip-npm') >= 0

		if(type !== 'web' && type !== 'api') {
			this.error('Invalid type option, only web & api are valid')
			process.exit(1)
		}

		const exists = await FS.exists(target)

		if(exists) {
			Log.error('Target directory already exists')
			process.exit(1)
		}

		this.comment(`Creating a new Grind ${type} application.`)

		let tag = this.option('tag')

		if(tag.isNil) {
			this.comment('Finding latest tag')
			const tags = await request(`https://api.github.com/repos/${repository}/tags`, {
				json: true,
				headers: { 'User-Agent': 'grind/installer' }
			})

			tag = tags[0].name
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

		await FS.remove('.git')
		await FS.writeFile('package.json', JSON.stringify(packageJson, null, '  '))

		if(!skipNpm) {
			Log.comment('Installing NPM')
			await this.exec('npm', [ 'install' ])
		}

		this.comment('Done')
	}

	exec(command, args) {
		return execFile(command, args).catch(err => {
			this.error('Error:')
			this.error('-- %s', err.stderr.trim().replace(/\n/g, `\n-- `))
			process.exit(1)
		})
	}

	async modifyFile(pathname, callback) {
		const contents = await FS.readFile(pathname)
		await FS.writeFile(pathname, callback(contents))
	}

}
