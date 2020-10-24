import later, { ScheduleData } from 'later'

import { Cli } from './Cli'
import { Command } from './Command'
import { InvocationError } from './Errors/InvocationError'

export type SchedulerJobType = 'closure' | 'className' | 'name'
export type SchedulerJobClosure = (args: any[]) => void | Promise<void>
export type SchedulerJobOptions = Partial<{
	className: typeof Command
	name: string
	closure: SchedulerJobClosure
	args: any[]
}>

export class SchedulerJob {
	driver = later
	schedule: ScheduleData | null | undefined = null

	isRunning = false
	allowOverlapping = false
	timeout: Number | null | undefined = null

	constructor(
		public cli: Cli,
		public type: SchedulerJobType,
		public options: SchedulerJobOptions,
	) {}

	start() {
		if (!this.schedule) {
			throw new InvocationError('Missing schedule')
		}

		this.driver.setInterval(() => {
			if (this.isRunning && !this.allowOverlapping) {
				return false
			}

			this.isRunning = true
			let promise: Promise<any | void> | null = null

			if (this.type === 'closure') {
				if (typeof this.timeout === 'number') {
					this._warn('WARNING: Scheduled job timeouts can not be used with closures.')
				}

				promise = Promise.resolve(this.options.closure?.(this.options.args ?? []))
			} else {
				let command: Command | undefined | null = null

				if (this.type === 'className' && this.options.className) {
					command = new this.options.className(this.cli.app, this.cli)
				} else if (this.type === 'name') {
					command = this.cli.commands.find(command => command.name === this.options.name)
				}

				if (!command) {
					return false
				}

				promise = this.executeCommand(command, this.options.args)
			}

			promise.then(() => {
				this.isRunning = false
			})
		}, this.schedule)
	}

	executeCommand(command: Command, args: string[] | null | undefined = null) {
		let description = command.name

		if (Array.isArray(args) && args.length > 0) {
			description += ` [${args.join(', ')}]`
		}

		const promise = command.spawn(args)
		let timeout: NodeJS.Timeout | null = null

		if (typeof this.timeout === 'number') {
			const childProcess = promise.childProcess
			timeout = setTimeout(() => {
				this._warn(
					`${description} exceeded it’s execution timeout of ${this.timeout}ms and is being terminated.`,
				)

				childProcess?.kill()
			}, this.timeout)
		}

		return promise.then(code => {
			if (timeout) {
				clearTimeout(timeout)
			}

			if (code !== 0) {
				this._warn(`${description} failed with code: ${code}`)
			}

			return code
		})
	}

	cron(str: string): this {
		this.schedule = this.driver.parse.cron(str)
		return this
	}

	everyMinute(): this {
		this.schedule = this.driver.parse.recur().every(1).minute()
		return this
	}

	everyFiveMinutes(): this {
		this.schedule = this.driver.parse.recur().every(5).minute()
		return this
	}

	everyTenMinutes(): this {
		this.schedule = this.driver.parse.recur().every(10).minute()
		return this
	}

	everyThirtyMinutes(): this {
		this.schedule = this.driver.parse.recur().every(30).minute()
		return this
	}

	hourly(): this {
		this.schedule = this.driver.parse.recur().every(1).hour()
		return this
	}

	daily(): this {
		this.schedule = this.driver.parse.recur().on('00:00:00').time()
		return this
	}

	dailyAt(time: string): this {
		this.schedule = this.driver.parse.recur().on(time).time()
		return this
	}

	twiceDaily(time1: string, time2: string): this {
		this.schedule = this.driver.parse
			.recur()
			.on(time1 as any, time2 as any)
			.time()
		return this
	}

	weekly(): this {
		this.schedule = this.driver.parse.recur().on(1).dayOfWeek()
		return this
	}

	monthly(): this {
		this.schedule = this.driver.parse.recur().on(1).dayOfMonth()
		return this
	}

	monthlyOn(day: number, time: string): this {
		this.schedule = this.driver.parse.recur().on(day).dayOfMonth().on(time).time()
		return this
	}

	timezone(tz: string): this {
		;(this.driver.date as any).timezone(tz)
		return this
	}

	UTC(): this {
		this.driver.date.UTC()
		return this
	}

	localTime(): this {
		this.driver.date.localTime()
		return this
	}

	withOverlapping(): this {
		this.allowOverlapping = true
		return this
	}

	withoutOverlapping(): this {
		this.allowOverlapping = false
		return this
	}

	withTimeout(timeout: number): this {
		this.timeout = Number(timeout) || null

		if (typeof this.timeout !== 'number' || this.timeout <= 0) {
			this.timeout = null
		}

		return this
	}

	withoutTimeout(): this {
		this.timeout = null
		return this
	}

	nextOccurence(): Date | null | undefined {
		if (!this.schedule) {
			return null
		}

		const schedule = this.driver.schedule(this.schedule).next(1)

		if (Array.isArray(schedule)) {
			return schedule[0]
		} else if (schedule) {
			return schedule
		}

		return null
	}

	_warn(message: string) {
		return this.cli.output.writeln(`<warn>${message}</warn>`)
	}
}
