import { AbortError, Command, InputArgument, InputOption, StubCompiler } from 'grind-cli'

import Inflect from 'i'
import Path from 'path'

export class MakeJobCommand extends Command {
	name = 'make:job'
	description = 'Create a job class'
	arguments = [ 'name?' ]
	options = {
		type: 'Name of the type of job to create'
	}

	arguments = [
		new InputArgument('name', InputArgument.VALUE_OPTIONAL, 'The name of the job.')
	]

	options = [
		new InputOption('type', InputOption.VALUE_OPTIONAL, 'Name of the type of job to create')
	]

	run() {
		let name = this.argument('name', '').trim()
		let type = this.option('type', '').trim()
		const inflect = Inflect()

		if(this.containsOption('type')) {
			type = this.option('type')

			if(name.isNil) {
				name = `${inflect.classify(type)}Job`
			}
		}

		if(name.length === 0 && type.length === 0) {
			throw new AbortError('A job name must be provided if `--type` isn’t used.')
		}

		if(type.length === 0) {
			type = inflect.underscore(name).replace(/_/g, '-')
		} else if(name.length === 0) {
			name = inflect.classify(type.replace(/-/g, '_'))
		}

		if(!type.endsWith('-job')) {
			type += '-job'
		}

		if(!name.endsWith('Job')) {
			name += 'Job'
		}

		const filePath = this.app.paths.app('Jobs', `${name}.js`)
		return StubCompiler(Path.join(__dirname, 'stubs', 'Job.stub'), filePath, {
			StubName: name,
			StubType: type
		}).then(() => {
			this.success(`Created ${Path.relative(process.cwd(), filePath)}`)
		})
	}

}
