import { Application } from '@grindjs/framework'

import { Command } from './Command'
import { HelpCommand } from './Commands/HelpCommand'
import { ListCommand } from './Commands/ListCommand'
import { ScheduleRunCommand } from './Commands/ScheduleRunCommand'
import { TinkerCommand } from './Commands/TinkerCommand'
import { CommandNotFoundError } from './Errors/CommandNotFoundError'
import { Input } from './Input/Input'
import { Output } from './Output/Output'
import { Scheduler } from './Scheduler'
import { SchedulerJobClosure } from './SchedulerJob'

export class Cli {
	commands: Command[] = []
	output = new Output(this)
	scheduler = new Scheduler(this)

	constructor(public app: Application) {
		this.register(ScheduleRunCommand)
		this.register(TinkerCommand)
	}

	run(args = process.argv.slice(2)) {
		return this.app
			.boot()
			.then(() => this.execute(args))
			.then(() => {
				process.exit(0)
			})
			.catch(err => {
				this.output.writeError(err)
				process.exit(1)
			})
	}

	async execute(args: string[]) {
		const input = new Input(args)
		const name = (input.arguments[0] || {}).value
		this.output.formatter.decorated = !input.hasParameterOption('no-ansi')

		let command: Command | null | undefined = null
		let defaultCommand = false

		if (typeof name !== 'string') {
			command = new ListCommand(this.app, this)
			defaultCommand = true
		} else {
			command = this.find(name)

			if (!command) {
				if (name !== 'help') {
					throw new CommandNotFoundError(name)
				}

				command = new ListCommand(this.app, this)
				defaultCommand = true
			}
		}

		let run = command

		if (
			!defaultCommand &&
			(input.hasParameterOption('help') || input.hasParameterOption('h'))
		) {
			run = new HelpCommand(this.app, this, command)
		}

		return run.execute(input)
	}

	find(name: string): Command | null | undefined {
		for (const command of this.commands) {
			if (command.name === name) {
				return command
			}
		}

		return null
	}

	register(...commands: (typeof Command | Command)[]) {
		if (commands.length === 1) {
			if (Array.isArray(commands[0])) {
				commands = commands[0] as any
			}
		}

		for (const command of commands) {
			if (typeof command === 'function') {
				this.commands.push(new command(this.app, this))
			} else {
				this.commands.push(command)
			}
		}
	}

	schedule(value: typeof Command | string | SchedulerJobClosure, ...args: any[]) {
		if (args.length > 0 && Array.isArray(args[0])) {
			args = args[0]
		}

		return this.scheduler.create(value, args)
	}
}
