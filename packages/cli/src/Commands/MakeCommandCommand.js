import '../Command'
import '../Input/InputArgument'
import '../Input/InputOption'
import '../StubCompiler'
import '../Errors/AbortError'

const path = require('path')

export class MakeCommandCommand extends Command {
	name = 'make:command'
	description = 'Create a command class'

	arguments = [
		new InputArgument('name', InputArgument.VALUE_OPTIONAL, 'The name of the command class.')
	]

	options = [
		new InputOption(
			'command',
			InputOption.VALUE_OPTIONAL,
			'Name of the command to be invoked via the cli',
			'command:name'
		)
	]

	run() {
		let name = this.argument('name')
		let command = null

		if(this.containsOption('command')) {
			command = this.option('command')

			if(name.isNil && (!command.isNil && command !== 'command:name')) {
				const upper = (_, letter) => letter.toUpperCase()
				name = command.replace(/[_\-:\s]+(\w|$)/g, upper).replace(/^(\w)/, upper)
				name += 'Command'
			}
		}

		if(command.isNil || command.length === 0) {
			command = 'command:name'
		}

		if(name.isNil) {
			throw new AbortError('A class name must be provided if `--command` isn’t used.')
		}

		const filePath = this.app.paths.app('Commands', `${name}.js`)
		return StubCompiler(path.join(__dirname, 'stubs', 'Command.stub'), filePath, {
			StubName: name,
			StubCommand: command
		}).then(() => {
			this.success(`Created ${path.relative(process.cwd(), filePath)}`)
		})
	}

}
