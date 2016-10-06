import { Command, StubCompiler } from 'grind-cli'

import Inflect from 'i'
import Path from 'path'

export class MakeJobCommand extends Command {
	name = 'make:job'
	description = 'Create a job class'
	arguments = [ 'className?' ]
	options = {
		jobName: 'Name of the type of job to create'
	}

	run() {
		let className = this.argument('className', '').trim()
		let jobName = this.option('jobName', '').trim()
		const inflect = Inflect()

		if(this.containsOption('table')) {
			jobName = this.option('table')

			if(className.isNil) {
				className = `${inflect.classify(jobName)}Job`
			}
		}

		if(className.length === 0 && jobName.length === 0) {
			this.error('A class name must be provided if `--name` isn’t used.')
			process.exit(1)
		}

		if(jobName.length === 0) {
			jobName = inflect.underscore(className).replace(/_/g, '-')
		} else if(className.length === 0) {
			className = inflect.classify(jobName.replace(/\-/g, '_'))
		}

		if(!jobName.endsWith('-job')) {
			jobName += '-job'
		}

		if(!className.endsWith('Job')) {
			className += 'Job'
		}

		const filePath = this.app.paths.app('Jobs', `${className}.js`)
		return StubCompiler(Path.join(__dirname, 'stubs', 'Job.stub'), filePath, {
			className,
			jobName
		}).then(() => {
			this.success(`Created ${Path.relative(process.cwd(), filePath)}`)
		})
	}

}
