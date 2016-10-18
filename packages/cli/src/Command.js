import './AbortError'
import './Scheduler'

import cast from 'as-type'
import chalk from 'chalk'
import readline from 'readline'
import ChildProcess from 'child_process'

export class Command {
	app = null
	cli = null

	name = null
	description = null
	arguments = [ ]
	options = { }
	scheduler = null

	compiledValues = {
		arguments: { },
		options: { }
	}

	constructor(app, cli) {
		this.app = app
		this.cli = cli
		this.scheduler = new Scheduler(this)
	}

	argument(name, fallback = null) {
		return this.compiledValues.arguments[name] || fallback
	}

	containsArgument(name) {
		const value = this.compiledValues.arguments[name]
		return !value.isNil
	}

	option(name, fallback = null) {
		return this.compiledValues.options[name] || fallback
	}

	containsOption(name) {
		const value = this.compiledValues.options[name]
		return !value.isNil
	}

	ready() {
		return Promise.resolve()
	}

	run() {
		return Promise.resolve()
	}

	build(cli) {
		const command = cli.command(this.name)
		command.description(this.description)

		const usage = [ ]
		const options = Object.keys(this.options).map(key => [ key, this.options[key] ])

		if(options.length > 0) {
			usage.push('[options]')
			const shorthands = { h: true }

			for(const option of options) {
				let shorthandCharCode = option[0].charCodeAt(0)
				let shorthand = String.fromCharCode(shorthandCharCode)

				while(shorthands[shorthand] === true) {
					if(++shorthandCharCode > 122) {
						shorthandCharCode = 65
					}

					shorthand = String.fromCharCode(shorthandCharCode)
				}

				shorthands[shorthand] = true

				let flags = `-${shorthand}, --${option[0]}`

				if(typeof option[1] === 'string' || option.type.isNil) {
					flags += ' [string]'
				}

				if(typeof option[1] !== 'string') {
					option[1] = option[1].description || ''
				}

				command.option(flags, option[1])
			}
		}

		let hadOptional = false
		for(const argument of this.arguments) {
			const isOptional = argument.endsWith('?')

			if(!hadOptional && isOptional) {
				hadOptional = true
			} else if(hadOptional && !isOptional) {
				this.error(
					'Invalid arguments for %s: %s',
					this.name,
					'An optional argument can not be followed by a non-optional argument'
				)

				process.exit(1)
			}

			usage.push(`<${argument}>`)
		}

		command.usage(usage)
		command.action((...args) => this._execute(...args))

		return command
	}

	_execute(...args) {
		const cli = args.pop()

		const requiredArguments = [ ]

		for(const argument of this.arguments) {
			if(argument.endsWith('?')) {
				break
			}

			requiredArguments.push(argument)
		}

		if(args.length < requiredArguments.length) {
			this.error(
				'Not enough arguments, missing: %s',
				requiredArguments.slice(args.length).join(', ')
			)

			process.exit(1)
		} else if(args.length > this.arguments.length) {
			this.error('Too many arguments.', args)

			process.exit(1)
		}

		for(const i in args) {
			let name = this.arguments[i]

			if(name.endsWith('?')) {
				name = name.substring(0, name.length - 1)
			}

			this.compiledValues.arguments[name] = args[i]
		}

		for(const option of Object.keys(this.options)) {
			const name = option.split('-').reduce((str, word) => {
				return `${str}${word[0].toUpperCase()}${word.slice(1)}`
			})

			this.compiledValues.options[option] = cli[name]
		}

		process.title = `node ${this.name}`

		this.ready()
		.then(() => this.run())
		.then(() => process.exit(0))
		.catch(err => {
			if(err instanceof AbortError) {
				this.error(err.message)
			} else {
				this.error(err.message, err.stack)
			}

			process.exit(1)
		})
	}

	schedule() {
		return []
	}

	registerSchedule() {
		const schedules = this.schedule()

		if(!schedules) {
			schedules = [ ]
		}

		if(schedules instanceof SchedulerJob) {
			schedules = [ schedules ]
		}

		schedules.map(schedule => {
			this.success(this.name + ' has been scheduled to run next at: ' + schedule.nextOccurence())
			schedule.start()
		})
	}

	execAsChildProcess(args) {
		const execFile = ChildProcess.execFile

		const options = {
			env: process.env
		}

		if(!args) {
			args = [ ]
		} else {
			args = [ ].concat(...args)
		}

		args.unshift(this.name)

		return new Promise((resolve, reject) => {
			execFile(process.env.CLI_BIN, args, options, (err, stdout, stderr) => {
				if(err instanceof Error) {
					return reject(err)
				}

				resolve(stdout)
			})
		})
	}

	info(...message) {
		return this.cli.output.info(...message)
	}

	comment(...message) {
		return this.cli.output.comment(...message)
	}

	warn(...message) {
		return this.cli.output.warn(...message)
	}

	error(...message) {
		return this.cli.output.error(...message)
	}

	success(...message) {
		return this.cli.output.success(...message)
	}

	ask(question) {
		const prompt = chalk.magenta(question)

		return new Promise(resolve => {
			const iface = readline.createInterface({
				input: process.stdin,
				output: process.stdout
			})

			iface.question(`${prompt} `, answer => {
				iface.close()
				resolve((answer || '').trim())
			})
		})
	}

	confirm(question, defaultAnswer = true) {
		const prompt = `${question} ${chalk.dim(`[${defaultAnswer ? 'yes' : 'no'}]`)}`

		return this.ask(prompt, 'boolean', defaultAnswer ? 'yes' : 'no').then(answer => {
			if(answer.length === 0) {
				answer = defaultAnswer
			}

			return cast.boolean(answer)
		})
	}

}
