import './Commands/HelpCommand'
import './Commands/ListCommand'
import './Commands/MakeCommandCommand'
import './Commands/ScheduleRunCommand'
import './Commands/TinkerCommand'

import './Errors/CommandNotFoundError'
import './Input/Input'
import './Output/Output'
import './Scheduler'

export class Cli {
	app = null
	commands = [ ]
	output = null
	scheduler = null

	constructor(app) {
		this.app = app
		this.output = new Output(this)
		this.scheduler = new Scheduler(this)

		this.register(MakeCommandCommand)
		this.register(TinkerCommand)
		this.register(ScheduleRunCommand)
	}

	run(args = process.argv.slice(2)) {
		return this.app.boot().then(() => this.execute(args)).then(() => {
			process.exit(0)
		}).catch(err => {
			this.output.writeError(err)
			process.exit(1)
		})
	}

	async execute(args) {
		const input = new Input(args)
		const name = (input.arguments[0] || { }).value
		this.output.formatter.decorated = !input.hasParameterOption('no-ansi')

		let command = null
		let defaultCommand = false

		if(name.isNil) {
			command = new ListCommand(this.app, this)
			defaultCommand = true
		} else {
			command = this.find(name)

			if(command.isNil) {
				if(name !== 'help') {
					throw new CommandNotFoundError(name)
				}

				command = new ListCommand(this.app, this)
				defaultCommand = true
			}
		}

		let run = command

		if(!defaultCommand && (input.hasParameterOption('help') || input.hasParameterOption('h'))) {
			run = new HelpCommand(this.app, this, command)
		}

		return run.execute(input)
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

	schedule(value, ...args) {
		if(args.length > 0 && Array.isArray(args[0])) {
			args = args[0]
		}

		return this.scheduler.create(value, args)
	}

}
