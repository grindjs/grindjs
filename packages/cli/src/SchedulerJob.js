import later from 'later'

export class SchedulerJob {

	provider = null
	scheduler = null
	cli = null

	type = null
	options = null

	isRunning = false
	allowOverlapping = false

	constructor(cli, type, options) {
		this.provider = later
		this.cli = cli
		this.type = type
		this.options = options
	}

	start() {
		this.provider.setInterval(() => {
			if(this.isRunning && !this.allowOverlapping) {
				return false
			}

			this.isRunning = true

			if(this.type === 'className') {
				const command = new this.options.className
				this.executeCommand(command, this.options.args)
			}

			if(this.type === 'name') {
				for(const command of this.cli.commands) {
					if(command.name === this.options.name) {
						this.executeCommand(command, this.options.args)
					}
				}
			}

			if(this.type === 'closure') {
				this.options.closure(this.options.args)
			}

			this.isRunning = false
		}, this.schedule)
	}

	executeCommand(command, args) {
		command.execAsChildProcess(args).then((output) => {
			this.cli.output.info(output)
		}).catch((err) => {
			this.cli.output.error(err)
		})
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
		return this
	}

	UTC() {
		this.provider.date.UTC()
		return this
	}

	localtime() {
		this.provider.date.localtime()
		return this
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
