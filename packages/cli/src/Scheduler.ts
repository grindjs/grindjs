import { Cli } from './Cli'
import { Command } from './Command'
import {
	SchedulerJob,
	SchedulerJobClosure,
	SchedulerJobOptions,
	SchedulerJobType,
} from './SchedulerJob'

export class Scheduler {
	jobs: SchedulerJob[] = []

	constructor(public cli: Cli) {}

	start() {
		return new Promise<void>((resolve, reject) => {
			for (const job of this.jobs) {
				if (!job.schedule) {
					return reject('Job is missing a schedule.')
				}

				job.start()
			}
		})
	}

	create(value: typeof Command | string | SchedulerJobClosure, args: any) {
		if (typeof value === 'string') {
			return this.name(value, args)
		} else if ((value as any).prototype instanceof Command) {
			return this.className(value as any, args)
		} else if (typeof value === 'function') {
			return this.call(value as any, args)
		}

		throw new Error(
			'Invalid command definition used to create schedule job. Must use: class name, cmd line string or closure.',
		)
	}

	className(className: typeof Command, args: any[]) {
		return this.addJob('className', { className, args })
	}

	name(name: string, args: any[]) {
		let cmd: string[] = []

		if (name.indexOf(' ') > 0) {
			cmd = name.trim().split(/\s+/)
			name = cmd.shift() ?? ''
			args = [...cmd, ...args]
		}

		return this.addJob('name', { name, args })
	}

	call(closure: SchedulerJobClosure, args: any[]) {
		return this.addJob('closure', { closure, args })
	}

	addJob(type: SchedulerJobType, options: SchedulerJobOptions) {
		const job = new SchedulerJob(this.cli, type, options)
		this.jobs.push(job)
		return job
	}
}
