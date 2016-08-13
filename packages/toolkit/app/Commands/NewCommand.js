import {Command} from 'grind-cli'
import {execFile} from 'child-process-promise'

import fs from 'fs-promise'
import path from 'path'
import request from 'request-promise-native'

export class NewCommand extends Command {
	name = 'new'
	description = 'Create a new Grind application'
	arguments = [ 'name' ]
	options = {
		type: 'API or Web. Defaults to web',
		tag: 'Repository tag to use, defaults to most recent tag',
		'skip-npm': 'If present, will not run npm install'
	}

	async run() {
		const type = this.option('type', 'web').toLowerCase()
		const repository = `grindjs/example-${type}`
		const target = this.argument('name')
		const skipNpm = process.argv.indexOf('--skip-npm') >= 0

		if(type !== 'web' && type !== 'api') {
			this.error('Invalid type option, only web & api are valid')
			process.exit(1)
		}

		const exists = await fs.exists(target)

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

		await fs.mkdirs(target)

		this.comment(`Cloning ${repository}@${tag}`)
		await this.exec('git', [
			'clone',
			'--depth', '1',
			'--branch', tag,
			`https://github.com/${repository}.git`,
			target
		])

		process.chdir(target)

		const packageContents = await fs.readFile('package.json')
		const packageJson = JSON.parse(packageContents)
		packageJson.version = '0.0.1'
		packageJson.name = path.basename(target)

		await fs.remove('.git')
		await fs.writeFile('package.json', JSON.stringify(packageJson, null, '  '))

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
		const contents = await fs.readFile(pathname)
		await fs.writeFile(pathname, callback(contents))
	}

}
