import { AbortError, Command, InputArgument, InputOption } from 'grind-cli'
import { Inflect } from 'grind-support'

const path = require('path')

export class MakeJobCommand extends Command {

	name = 'make:job'
	description = 'Create a job class'

	arguments = [
		new InputArgument('name', InputArgument.VALUE_OPTIONAL, 'The name of the job.')
	]

	options = [
		new InputOption('type', InputOption.VALUE_OPTIONAL, 'Name of the type of job to create')
	]

	async run() {
		let name = this.argument('name', '').trim()
		let type = this.option('type', '').trim()

		if(this.containsOption('type')) {
			type = this.option('type')

			if(name.isNil) {
				name = `${Inflect.classify(type)}Job`
			}
		}

		if(name.length === 0 && type.length === 0) {
			throw new AbortError('A job name must be provided if `--type` isn’t used.')
		}

		if(type.length === 0) {
			type = Inflect.underscore(name).replace(/_/g, '-')
		} else if(name.length === 0) {
			name = Inflect.classify(type.replace(/-/g, '_'))
		}

		if(!type.endsWith('-job')) {
			type += '-job'
		}

		if(!name.endsWith('Job')) {
			name += 'Job'
		}

		const filePath = this.app.paths.project(`app/Jobs/${name}.js`)

		await this.app.stubs.generate('grind-queue::job', filePath, {
			name,
			type,
		})

		return this.success(`Created ${path.relative(this.app.paths.project(), filePath)}`)
	}

}
