const later = require('later')

export class SchedulerJob {

	driver = null
	scheduler = null
	cli = null

	type = null
	options = null

	isRunning = false
	allowOverlapping = false

	constructor(cli, type, options) {
		this.driver = later
		this.cli = cli
		this.type = type
		this.options = options
	}

	start() {
		this.driver.setInterval(() => {
			if(this.isRunning && !this.allowOverlapping) {
				return false
			}

			this.isRunning = true
			let promise = null

			if(this.type === 'closure') {
				promise = Promise.resolve(this.options.closure(this.options.args))
			} else {
				let command = null

				if(this.type === 'className') {
					command = new this.options.className(this.cli.app, this.cli)
				} else if(this.type === 'name') {
					command = this.cli.commands.find(command => command.name === this.options.name)
				} else {
					return false
				}

				promise = this.executeCommand(command, this.options.args)
			}

			promise.then(() => {
				this.isRunning = false
			})
		}, this.schedule)
	}

	executeCommand(command, args) {
		return command.spawn(args).then(code => {
			if(code !== 0) {
				let description = command.name

				if(Array.isArray(args) && args.length > 0) {
					description += ` [${args.join(', ')}]`
				}

				this.cli.output.error('%s failed with code: %d', description, code)
			}

			return code
		})
	}

	cron(str) {
		this.schedule = this.driver.parse.cron(str)
		return this
	}

	everyMinute() {
		this.schedule = this.driver.parse.recur().every(1).minute()
		return this
	}

	everyFiveMinutes() {
		this.schedule = this.driver.parse.recur().every(5).minute()
		return this
	}

	everyTenMinutes() {
		this.schedule = this.driver.parse.recur().every(10).minute()
		return this
	}

	everyThirtyMinutes() {
		this.schedule = this.driver.parse.recur().every(30).minute()
		return this
	}

	hourly() {
		this.schedule = this.driver.parse.recur().every(1).hour()
		return this
	}

	daily() {
		this.schedule = this.driver.parse.recur().on('00:00:00').time()
		return this
	}

	dailyAt(time) {
		this.schedule = this.driver.parse.recur().on(time).time()
		return this
	}

	twiceDaily(time1, time2) {
		this.schedule = this.driver.parse.recur().on(time1, time2).time()
		return this
	}

	weekly() {
		this.schedule = this.driver.parse.recur().on(1).dayOfWeek()
		return this
	}

	monthly() {
		this.schedule = this.driver.parse.recur().on(1).dayOfMonth()
		return this
	}

	monthlyOn(day, time) {
		this.schedule = this.driver.parse.recur().on(day).dayOfMonth().on(time).time()
		return this
	}

	timezone(tz) {
		this.driver.date.timezone(tz)
		return this
	}

	UTC() {
		this.driver.date.UTC()
		return this
	}

	localTime() {
		this.driver.date.localtime()
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

		const schedule = this.driver.schedule(this.schedule).next(1)

		if(schedule) {
			return schedule
		}

		return null
	}

}
