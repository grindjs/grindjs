export class Output {

	outputter = Log

	info(...message) {
		return this.outputter.info(...message)
	}

	comment(...message) {
		return this.outputter.comment(...message)
	}

	warn(...message) {
		return this.outputter.warn(...message)
	}

	error(...message) {
		return this.outputter.error(...message)
	}

	success(...message) {
		return this.outputter.success(...message)
	}

}
