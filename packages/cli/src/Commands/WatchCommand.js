import '../Command'
import '../Errors/AbortError'

export class WatchCommand extends Command {

	name = 'watch'
	description = 'Start the HTTP server and monitors for changes'

	run() {
		throw new AbortError('You should not be seeing this, please check your Grind project.')
	}

}
