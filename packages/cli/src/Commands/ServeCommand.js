import '../Command'

import '../Errors/AbortError'
import '../Input/InputOption'

export class ServeCommand extends Command {
	name = 'serve'
	description = 'Start the HTTP server'

	options = [
		new InputOption(
			'cluster',
			InputOption.VALUE_OPTIONAL,
			'Run in cluster mode.',
			'Number of CPU cores'
		),
		new InputOption(
			'pid',
			InputOption.VALUE_OPTIONAL,
			'Write the PID to a file.'
		)
	]

	run() {
		throw new AbortError('You should not be seeing this, please check your Grind project.')
	}

}
