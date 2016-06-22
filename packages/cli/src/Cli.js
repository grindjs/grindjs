import program from 'commander'
import findRoot from 'find-root'
import path from 'path'

export class Cli {
	commands = [ ]
	app = null

	constructor(app) {
		this.app = app
	}

	run(args = process.argv) {
		this.app.boot()

		const rootPath = findRoot(path.dirname(require.main.filename))
		const info = require(path.join(rootPath, 'package.json'))
		const cli = program

		if(!info.version.isNil) {
			cli.version(info.version)
		}

		for(const command of this.commands) {
			command.build(cli)
		}

		if(args.length === 2) {
			args.push('--help')
		}

		cli.on('*', args => {
			this.output.error('Command ”%s” not found.', args.shift())
			process.exit(1)
		})

		cli.parse(args)
	}

	find(name) {
		for(const command of this.commands) {
			if(command.name === name) {
				return command
			}
		}

		return null
	}

	register(...commands) {
		if(commands.length === 1) {
			if(Array.isArray(commands[0])) {
				commands = commands[0]
			}
		}

		for(const command of commands) {
			if(typeof command === 'function') {
				this.commands.push(new command(this.app, this))
			} else {
				this.commands.push(command)
			}
		}
	}

}
