import { constructor as Chalk } from 'chalk'
const chalk = new Chalk({ enabled: true })

export class ChalkedConsoleLogger {
	info(...message) {
		console.log(...message)
	}

	comment(...message) {
		message[0] = chalk.blue(message[0])
		console.log(...message)
	}

	warn(...message) {
		message[0] = chalk.yellow(message[0])
		console.log(...message)
	}

	error(...message) {
		message[0] = chalk.bgRed.white(message[0])
		console.log(...message)
	}

	success(...message) {
		message[0] = chalk.green(message[0])
		console.log(...message)
	}
}
