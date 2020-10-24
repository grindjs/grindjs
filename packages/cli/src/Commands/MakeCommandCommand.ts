import path from 'path'

import { AbortError } from '../Errors/AbortError'
import { InputArgument } from '../Input/InputArgument'
import { InputOption } from '../Input/InputOption'
import { ToolkitCommand } from '../Toolkit/ToolkitCommand'

export class MakeCommandCommand extends ToolkitCommand {
	name = 'make:command'
	description = 'Create a command class'

	arguments = [
		new InputArgument('name', InputArgument.VALUE_OPTIONAL, 'The name of the command class.'),
	]

	options = [
		new InputOption(
			'command',
			InputOption.VALUE_OPTIONAL,
			'Name of the command to be invoked via the cli',
			'command:name',
		),
	]

	async run() {
		let name = this.argument('name')
		let command = null

		if (this.containsOption('command')) {
			command = this.option('command')

			if (
				typeof name !== 'string' &&
				typeof command === 'string' &&
				command !== 'command:name'
			) {
				const upper = (_: string, letter: string) => letter.toUpperCase()
				name = command.replace(/[_\-:\s]+(\w|$)/g, upper).replace(/^(\w)/, upper)
				name += 'Command'
			}
		}

		if (typeof command !== 'string' || command.length === 0) {
			command = 'command:name'
		}

		if (typeof name !== 'string') {
			throw new AbortError('A class name must be provided if `--command` isn’t used.')
		}

		const filePath = this.app.paths.project(`app/Commands/${name}.js`)

		await this.app.stubs.generate('@grindjs/cli::command', filePath, { name, command })

		return this.success(`Created ${path.relative(this.app.paths.project(), filePath)}`)
	}
}
