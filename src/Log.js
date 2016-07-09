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

}
