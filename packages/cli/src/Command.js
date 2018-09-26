/* eslint-disable max-lines */
import './Input/InputOption'
import './Input/InputArgument'

import './Errors/InvalidOptionError'
import './Errors/InvalidOptionValueError'
import './Errors/MissingArgumentError'
import './Errors/MissingOptionError'
import './Errors/TooManyArgumentsError'

const cast = require('as-type')
const readline = require('readline')
const ChildProcess = require('child_process')

let hasWarnedLegacyArgumentsOptions = false

function warnLegacyArgumentsOptions() {
	if(hasWarnedLegacyArgumentsOptions) {
		return
	}

	hasWarnedLegacyArgumentsOptions = true
	Log.error('WARNING: The arguments/options structure being used is deprecated in 0.6 and will be removed in 0.8.')
	Log.error('--> For information on how to update your commands, visit https://grind.rocks/docs/guides/cli')
	Log.error('')
}

export class Command {

	app = null
	cli = null

	name = null
	description = null
	arguments = [ ]
	options = [ ]

	defaultOptions = [
		new InputOption('help', InputOption.VALUE_NONE, 'Display this help message'),
		new InputOption('no-ansi', InputOption.VALUE_NONE, 'Disable ANSI output')
	]

	compiledValues = {
		arguments: { },
		options: { }
	}

	constructor(app, cli) {
		this.app = app
		this.cli = cli
	}

	get output() {
		return this.cli.output
	}

	argument(name, fallback = null) {
		return (this.compiledValues.arguments[name] || { }).value || fallback
	}

	containsArgument(name) {
		const { value } = this.compiledValues.arguments[name] || { }
		return !value.isNil
	}

	option(name, fallback = null) {
		return (this.compiledValues.options[name] || { }).value || fallback
	}

	containsOption(name) {
		const { value } = this.compiledValues.options[name] || { }
		return !value.isNil
	}

	ready() {
		return Promise.resolve()
	}

	run() {
		return Promise.resolve()
	}

	_prepare(input) {
		this.compiledValues.arguments = { }
		this.compiledValues.options = { }

		const args = this._arguments()
		const options = { }

		for(const option of this._options()) {
			options[option.name] = option
		}

		for(const option of this.defaultOptions) {
			options[option.name] = option
		}

		// Ensure the input arguments doesn’t exceed the
		// number of defined arguments
		const argumentsLength = input.arguments.length

		if(argumentsLength - 1 > args.length) {
			throw new TooManyArgumentsError
		}

		// Iterate through input arguments and match them to
		// to the defined arguments
		for(let i = 1; i < argumentsLength; i++) {
			input.arguments[i].name = args[i - 1].name
			input.arguments[i].mode = args[i - 1].mode
			input.arguments[i].help = args[i - 1].help

			this.compiledValues.arguments[args[i - 1].name] = input.arguments[i]
		}

		// If the input argument length isn’t the same as the
		// defined argument length, iterate through and make sure
		// all the required arguments are satisfied
		if(this.compiledValues.arguments.length !== arguments.length) {
			for(const argument of args) {
				const arg = this.compiledValues.arguments[argument.name]

				if(!arg.isNil) {
					continue
				}

				if(argument.mode === InputArgument.VALUE_REQUIRED) {
					throw new MissingArgumentError(argument.name)
				} else if(!argument.value.isNil) {
					this.compiledValues.arguments[argument.name] = argument
				}
			}
		}

		// Iterate through input options and match them to
		// the defined options
		for(const option of input.options) {
			const definedOption = options[option.name]

			if(definedOption.isNil) {
				throw new InvalidOptionError(option.name)
			}

			if(definedOption.mode === InputOption.VALUE_NONE) {
				if(!option.value.isNil && typeof option.value !== 'boolean') {
					throw new InvalidOptionValueError(option.name)
				}
			}

			option.mode = definedOption.mode
			option.help = definedOption.help
			option.value = option.value.isNil ? definedOption.value : option.value

			this.compiledValues.options[option.name] = option
		}

		// If the input options length isn’t the same as the
		// defined option length, iterate through and make sure
		// all the required options are satisfied
		if(Object.keys(this.compiledValues.options).length !== Object.keys(options).length) {
			for(const option of Object.values(options)) {
				if(option.mode === InputOption.VALUE_NONE) {
					continue
				}

				const compiledOption = this.compiledValues.options[option.name]

				if(!compiledOption.isNil) {
					continue
				}

				if(option.mode === InputOption.VALUE_REQUIRED) {
					throw new MissingOptionError(option.name)
				}

				this.compiledValues.options[option.name] = option
			}
		}
	}

	execute(input) {
		this._prepare(input)

		return this.ready().then(() => this.run())
	}

	_arguments() {
		if(this.arguments.isNil) {
			return [ ]
		}

		return this.arguments.map(value => {
			if(typeof value !== 'string') {
				return value
			}

			warnLegacyArgumentsOptions()

			const optional = value.endsWith('?')
			const name = optional ? value.substring(0, value.length - 1) : value

			return new InputArgument(
				name,
				optional ? InputArgument.VALUE_OPTIONAL : InputArgument.VALUE_REQUIRED
			)
		})
	}

	_options() {
		if(this.options.isNil) {
			return [ ]
		}

		if(Array.isArray(this.options)) {
			return this.options
		}

		const options = [ ]

		warnLegacyArgumentsOptions()

		for(const [ name, value ] of Object.entries(this.options)) {
			let help = value
			let mode = InputOption.VALUE_NONE

			if(Array.isArray(value)) {
				help = value[0]
				mode = InputOption.VALUE_REQUIRED
			}

			options.push(new InputOption(name, mode, help))
		}

		return options
	}

	execAsChildProcess(args = null, options = null) {
		options = {
			env: process.env,
			...(options || { })
		}

		if(args.isNil) {
			args = [ ]
		} else {
			args = [ ].concat(...args)
		}

		args.unshift(this.name)

		return new Promise((resolve, reject) => {
			ChildProcess.execFile(process.env.CLI_BIN, args, options, (err, stdout) => {
				if(!err.isNil) {
					return reject(err)
				}

				resolve(stdout)
			})
		})
	}

	spawn(args = null, options = null) {
		options = {
			env: process.env,
			stdio: 'inherit',
			...(options || { })
		}

		if(args.isNil) {
			args = [ ]
		} else {
			args = [ ].concat(...args)
		}

		args.unshift(this.name)

		const childProcess = ChildProcess.spawn(process.env.CLI_BIN, args, options)
		const promise = new Promise(resolve => {
			childProcess.on('close', code => {
				resolve(Number.parseInt(code))
			})
		})

		promise.childProcess = childProcess

		return promise
	}

	line(...messages) {
		this.cli.output.writeln(...messages)
	}

	info(...messages) {
		this.cli.output.writeln(`<info>${messages.shift()}</info>`, ...messages)
	}

	comment(...messages) {
		this.cli.output.writeln(`<comment>${messages.shift()}</comment>`, ...messages)
	}

	warn(...messages) {
		this.cli.output.writeln(`<warn>${messages.shift()}</warn>`, ...messages)
	}

	success(...messages) {
		this.cli.output.writeln(`<success>${messages.shift()}</success>`, ...messages)
	}

	error(...messages) {
		this.cli.output.writeln(`<error>${messages.shift()}</error>`, ...messages)
	}

	ask(question, defaultAnswer = null) {
		let prompt = `<question>${question}</question> `

		if(!defaultAnswer.isNil) {
			prompt = `${prompt}<questionDefaultValue>[${defaultAnswer}]</questionDefaultValue> `
		}

		return new Promise(resolve => {
			const iface = readline.createInterface({
				input: process.stdin,
				output: process.stdout
			})

			iface.question(this.output.formatter.format(prompt), answer => {
				iface.close()
				resolve((answer || defaultAnswer || '').trim())
			})
		})
	}

	confirm(question, defaultAnswer = true) {
		return this.ask(question, defaultAnswer ? 'yes' : 'no').then(answer => {
			if(answer.length === 0) {
				answer = defaultAnswer
			}

			return cast.boolean(answer)
		})
	}

}
