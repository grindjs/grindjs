import later from 'later'

export class Scheduler {

	command = null
	provider = later

	schedule = null
	allowOverlapping = false
	_running = false

	constructor(command) {
		this.command = command
	}

	start(job) {
		return new Promise((resolve, reject) => {
			if(!this.schedule) {
				return reject('No schedule has been defined.')
			}

			this.provider.setInterval(() => {
				if(this._running && !this.allowOverlapping) {
					return false
				}

				this._running = true

				job()

				this._running = false
			}, this.schedule)
		})
	}

	cron(str) {
		return this.setSchedule(this.provider.parse.cron(str))
	}

	everyMinute() {
		return this.setSchedule(this.provider.parse.recur().every(1).minute())
	}

	everyFiveMinutes() {
		return this.setSchedule(this.provider.parse.recur().every(5).minute())
	}

	everyTenMinutes() {
		return this.setSchedule(this.provider.parse.recur().every(10).minute())
	}

	everyThirtyMinutes() {
		return this.setSchedule(this.provider.parse.recur().every(30).minute())
	}

	hourly() {
		return this.setSchedule(this.provider.parse.recur().every(1).hour())
	}

	daily() {
		return this.setSchedule(this.provider.parse.recur().on('00:00:00').time())
	}

	dailyAt(time) {
		return this.setSchedule(this.provider.parse.recur().on(time).time())
	}

	twiceDaily(time1, time2) {
		return this.setSchedule(this.provider.parse.recur().on(time1, time2).time())
	}

	weekly() {
		return this.setSchedule(this.provider.parse.recur().on(1).dayOfWeek())
	}

	monthly() {
		return this.setSchedule(this.provider.parse.recur().on(1).dayOfMonth())
	}

	monthlyOn(day, time) {
		return this.setSchedule(this.provider.parse.recur().on(day).dayOfMonth().on(time).time())
	}

	timezone(tz) {
		return new Promise(async (resolve) => {
			await this.provider.date.timezone(tz)
			return resolve(this)
		})
	}

	UTC() {
		return new Promise(async (resolve) => {
			await this.provider.date.UTC()
			return resolve(this)
		})
	}

	localtime() {
		return new Promise(async (resolve) => {
			await this.provider.date.localtime()
			return resolve(this)
		})
	}

	withOverlapping() {
		return new Promise((resolve) => {
			this.allowOverlapping = true
			return resolve(this)
		})
	}

	withoutOverlapping() {
		return new Promise((resolve) => {
			this.allowOverlapping = false
			return resolve(this)
		})
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

	setSchedule(schedule) {
		return new Promise((resolve, reject) => {
			try {
				this.schedule = schedule
			} catch(err) {
				return reject(err)
			}

			return resolve(this)
		})
	}
}
