import './SchedulerJob'

import later from 'later'

export class Scheduler {

	provider = later
	cli = null

	jobs = []

	constructor(runCommand) {
		this.cli = runCommand.cli
	}

	start() {
		return new Promise((resolve, reject) => {
			this.jobs.map((job) => {
				if(!job.schedule) {
					return reject('Missing a job schedule.')
				}

				job.start()
			})
		})
	}

	command(cmd, args) {
		cmdArray = []

		if(cmd.indexOf(' ') > 0) {
			cmdArray = cmd.trim().split(' ')
			cmd = cmdArray.shift()
			args = [ ].concat(cmdArray, args)
		}

		return this.addJob('command', {
			command: cmd,
			args: args
		})
	}

	call(closure) {
		return this.addJob('closure', {
			closure: closure
		})
	}

	addJob(type, options) {
		const job = new SchedulerJob(this, type, options)
		this.jobs.push(job)
		return job
	}

}
