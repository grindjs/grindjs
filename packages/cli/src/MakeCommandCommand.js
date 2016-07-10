import './Command'
import './StubCompiler'

import path from 'path'

export class MakeCommandCommand extends Command {
	name = 'make:command'
	description = 'Create a command class'
	arguments = [ 'className?' ]
	options = {
		command: 'Name of the command to be invoked via the cli'
	}

	run() {
		let className = this.argument('className')
		let commandName = null

		if(this.containsOption('command')) {
			commandName = this.option('command')

			if(className.isNil) {
				const upper = (_, letter) => letter.toUpperCase()
				className = commandName.replace(/[_\-:\s]+(\w|$)/g, upper).replace(/^(\w)/, upper)
				className += 'Command'
			}
		}

		if(className.isNil) {
			this.error('A file name must be provided if `--command` isn’t used.')
			process.exit(1)
		}

		const filePath = this.app.paths.app('Commands', `${className}.js`)
		return StubCompiler(path.join(__dirname, 'stubs', 'Command.stub'), filePath, {
			className,
			commandName
		}).then(() => {
			this.success(`Created ${path.relative(process.cwd(), filePath)}`)
		})
	}

}
