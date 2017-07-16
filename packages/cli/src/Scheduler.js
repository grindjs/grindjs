import './Command'
import './SchedulerJob'

export class Scheduler {

	cli = null
	jobs = [ ]

	constructor(cli) {
		this.cli = cli
	}

	start() {
		return new Promise((resolve, reject) => {
			for(const job of this.jobs) {
				if(!job.schedule) {
					return reject('Job is missing a schedule.')
				}

				job.start()
			}
		})
	}

	create(value, args) {
		if(value.prototype instanceof Command) {
			return this.className(value, args)
		}

		if(typeof value === 'string') {
			return this.name(value, args)
		}

		if(typeof value === 'function') {
			return this.call(value, args)
		}

		throw new Error(
			'Invalid command definition used to create schedule job. Must use: class name, cmd line string or closure.'
		)
	}

	className(className, args) {
		return this.addJob('className', {
			className: className,
			args: args
		})
	}

	name(name, args) {
		let cmd = [ ]

		if(name.indexOf(' ') > 0) {
			cmd = name.trim().split(/\s+/)
			name = cmd.shift()
			args = [ ].concat(cmd, args)
		}

		return this.addJob('name', {
			name: name,
			args: args
		})
	}

	call(closure, args) {
		return this.addJob('closure', {
			closure: closure,
			args: args
		})
	}

	addJob(type, options) {
		const job = new SchedulerJob(this.cli, type, options)
		this.jobs.push(job)
		return job
	}

}
