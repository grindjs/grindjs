import later from 'later'

export class SchedulerJob {

	provider = null
	scheduler = null
	cli = false

	type = null
	options = null

	isRunning = false
	allowOverlapping = false

	constructor(scheduler, type, options) {
		this.provider = later
		this.cli = scheduler.cli
		this.type = type
		this.options = options
	}

	start() {
		this.provider.setInterval(() => {
			if(this.isRunning && !this.allowOverlapping) {
				return false
			}

			this.isRunning = true

			if(this.type === 'command') {
				for(const command of this.cli.commands) {
					if(command.name === this.options.command) {
						command.execAsChildProcess(this.options.args).then((output) => {
							this.cli.output.info(output)
						}).catch((err) => {
							this.cli.output.error(err)
						})
					}
				}
			}

			if(this.type === 'closure') {
				this.options.closure()
			}

			this.isRunning = false
		}, this.schedule)
	}

	cron(str) {
		this.schedule = this.provider.parse.cron(str)
		return this
	}

	everyMinute() {
		this.schedule = this.provider.parse.recur().every(1).minute()
		return this
	}

	everyFiveMinutes() {
		this.schedule = this.provider.parse.recur().every(5).minute()
		return this
	}

	everyTenMinutes() {
		this.schedule = this.provider.parse.recur().every(10).minute()
		return this
	}

	everyThirtyMinutes() {
		this.schedule = this.provider.parse.recur().every(30).minute()
		return this
	}

	hourly() {
		this.schedule = this.provider.parse.recur().every(1).hour()
		return this
	}

	daily() {
		this.schedule = this.provider.parse.recur().on('00:00:00').time()
		return this
	}

	dailyAt(time) {
		this.schedule = this.provider.parse.recur().on(time).time()
		return this
	}

	twiceDaily(time1, time2) {
		this.schedule = this.provider.parse.recur().on(time1, time2).time()
		return this
	}

	weekly() {
		this.schedule = this.provider.parse.recur().on(1).dayOfWeek()
		return this
	}

	monthly() {
		this.schedule = this.provider.parse.recur().on(1).dayOfMonth()
		return this
	}

	monthlyOn(day, time) {
		this.schedule = this.provider.parse.recur().on(day).dayOfMonth().on(time).time()
		return this
	}

	timezone(tz) {
		this.provider.date.timezone(tz)
	}

	UTC() {
		this.provider.date.UTC()
	}

	localtime() {
		this.provider.date.localtime()
	}

	withOverlapping() {
		this.allowOverlapping = true
		return this
	}

	withoutOverlapping() {
		this.allowOverlapping = false
		return this
	}

	nextOccurence() {
		if(!this.schedule) {
			return null
		}

		const schedule = this.provider.schedule(this.schedule).next(1)

		if(schedule) {
			return schedule
		}

		return null
	}

}
