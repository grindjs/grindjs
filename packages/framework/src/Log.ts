import { ChalkedConsoleLogger } from './Logger/ChalkedConsoleLogger'
import { Logger } from './Logger/Logger'

export class Log {
	static logger: Logger = new ChalkedConsoleLogger()

	static info(...message: any[]) {
		Log.logger.info(...message)
	}

	static comment(...message: any[]) {
		Log.logger.comment(...message)
	}

	static warn(...message: any[]) {
		Log.logger.warn(...message)
	}

	static error(...message: any[]) {
		Log.logger.error(...message)
	}

	static success(...message: any[]) {
		Log.logger.success(...message)
	}

	static deprecated(
		name: any[],
		{
			version,
			obsoleted,
			rename,
		}: Partial<{ version: string; obsoleted: string; rename: string }> = {},
	) {
		let message = `WARNING: ${name} has been deprecated`

		if ((version || '').length > 0) {
			message += ` as of ${version}`
		}

		if ((obsoleted || '').length > 0) {
			message += ` and will be removed in ${obsoleted}`
		}

		message += '.'

		if ((rename || '').length > 0) {
			message += ` Use ${rename} instead.`
		}

		this.warn(message)
	}
}
