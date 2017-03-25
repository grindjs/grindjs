import './ChalkedConsoleLogger'

export class Log {

	static logger = new ChalkedConsoleLogger

	static info(...message) {
		Log.logger.info(...message)
	}

	static comment(...message) {
		Log.logger.comment(...message)
	}

	static warn(...message) {
		Log.logger.warn(...message)
	}

	static error(...message) {
		Log.logger.error(...message)
	}

	static success(...message) {
		Log.logger.success(...message)
	}

	static deprecated(name, { version, obsoleted, rename } = { }) {
		let message = `WARNING: ${name} has been deprecated`

		if((version || '').length > 0) {
			message += ` as of ${version}`
		}

		if((obsoleted || '').length > 0) {
			message += ` and will be removed in ${obsoleted}`
		}

		message += '.'

		if((rename || '').length > 0) {
			message += ` Use ${rename} instead.`
		}

		this.warn(message)
	}

}
