import './DetectPackagesProvider'

const path = require('path')

export function PackageCommandsProvider(app) {
	for(const pkg of app.packages) {
		const commands = [ ]

		if(Array.isArray(pkg.config.commands)) {
			commands.push(...pkg.config.commands)
		} else if(!pkg.config.command.isNil) {
			commands.push(pkg.config.command)
		}

		if(commands.length === 0) {
			return
		}

		for(const command of commands) {
			const exportName = path.basename(command, path.extname(command))
			const { [exportName]: commandClass } = require(path.join(pkg.path, command))

			if(commandClass.isNil) {
				continue
			}

			app.cli.register(commandClass)
		}
	}
}

PackageCommandsProvider.priority = DetectPackagesProvider.priority - 1
