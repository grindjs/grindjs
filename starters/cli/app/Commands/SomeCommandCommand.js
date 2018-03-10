import { Command, InputArgument, InputOption } from 'grind-cli'

export class SomeCommandCommand extends Command {

	// Name of the command
	name = 'some:command'

	// Description of the command to show in help
	description = 'Command description'

	// Arguments available for this command
	arguments = [
		new InputArgument('requiredArg', InputArgument.VALUE_REQUIRED, 'This argument is required'),
		new InputArgument('optionalArg', InputArgument.VALUE_OPTIONAL, 'This argument is optional', 'Default value'),
	]

	// Options for this command
	options = [
		new InputOption('someOption', InputOption.VALUE_OPTIONAL, 'This is an optional option', 'Default Value'),
		new InputOption('quiet', InputOption.VALUE_NONE, 'This is a flag option')
	]

	run() {
		// Build something great!
	}

}
