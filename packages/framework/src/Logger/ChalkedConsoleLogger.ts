import { Instance as Chalk } from 'chalk'
import { Logger } from './Logger'
const chalk = new Chalk()

export class ChalkedConsoleLogger implements Logger {
	info(...message: any[]) {
		console.log(...message)
	}

	comment(...message: any[]) {
		message[0] = chalk.blue(message[0])
		console.log(...message)
	}

	warn(...message: any[]) {
		message[0] = chalk.yellow(message[0])
		console.log(...message)
	}

	error(...message: any[]) {
		message[0] = chalk.bgRed.white(message[0])
		console.log(...message)
	}

	success(...message: any[]) {
		message[0] = chalk.green(message[0])
		console.log(...message)
	}
}
