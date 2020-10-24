import ChildProcess, { ExecFileOptions, SpawnOptions } from 'child_process'
import { BaseEncodingOptions } from 'fs'
import readline from 'readline'

import { Application, Log } from '@grindjs/framework'
import cast from 'as-type'

import { Cli } from './Cli'
import { InvalidOptionError } from './Errors/InvalidOptionError'
import { InvalidOptionValueError } from './Errors/InvalidOptionValueError'
import { InvocationError } from './Errors/InvocationError'
import { MissingArgumentError } from './Errors/MissingArgumentError'
import { MissingOptionError } from './Errors/MissingOptionError'
import { TooManyArgumentsError } from './Errors/TooManyArgumentsError'
import { Input } from './Input/Input'
import { InputArgument } from './Input/InputArgument'
import { InputOption } from './Input/InputOption'

export interface SpawnedPromise<T> extends Promise<T> {
	childProcess: ChildProcess.ChildProcess | undefined
}

export class Command {
	name: string | null = null
	description: string | null = null
	arguments: InputArgument[] = []
	options: InputOption[] = []

	defaultOptions = [
		new InputOption('help', InputOption.VALUE_NONE, 'Display this help message'),
		new InputOption('no-ansi', InputOption.VALUE_NONE, 'Disable ANSI output'),
	]

	compiledValues: {
		arguments: Record<string, InputArgument>
		options: Record<string, InputOption>
	} = {
		arguments: {},
		options: {},
	}

	constructor(public app: Application, public cli: Cli) {}

	get output() {
		return this.cli.output
	}

	argument(name: string, fallback = null) {
		return (this.compiledValues.arguments[name] || {}).value || fallback
	}

	containsArgument(name: string) {
		const { value } = this.compiledValues.arguments[name] || {}
		return value !== null && value !== undefined
	}

	option(name: string, fallback = null) {
		return (this.compiledValues.options[name] || {}).value || fallback
	}

	containsOption(name: string) {
		const { value } = this.compiledValues.options[name] || {}
		return value !== null && value !== undefined
	}

	ready(): Promise<void> {
		return Promise.resolve()
	}

	run(): Promise<void> | void {
		return Promise.resolve()
	}

	_prepare(input: Input) {
		this.compiledValues.arguments = {}
		this.compiledValues.options = {}

		const args = this._arguments()
		const options: Record<string, InputOption> = {}

		for (const option of this._options()) {
			options[option.name] = option
		}

		for (const option of this.defaultOptions) {
			options[option.name] = option
		}

		// Ensure the input arguments doesn’t exceed the
		// number of defined arguments
		const argumentsLength = input.arguments.length

		if (argumentsLength - 1 > args.length) {
			throw new TooManyArgumentsError()
		}

		// Iterate through input arguments and match them to
		// to the defined arguments
		for (let i = 1; i < argumentsLength; i++) {
			input.arguments[i].name = args[i - 1].name
			input.arguments[i].mode = args[i - 1].mode
			input.arguments[i].help = args[i - 1].help

			this.compiledValues.arguments[args[i - 1].name] = input.arguments[i]
		}

		// If the input argument length isn’t the same as the
		// defined argument length, iterate through and make sure
		// all the required arguments are satisfied
		if (Object.values(this.compiledValues.arguments).length !== args.length) {
			for (const argument of args) {
				const arg = this.compiledValues.arguments[argument.name]

				if (arg instanceof InputArgument) {
					continue
				}

				if (argument.mode === InputArgument.VALUE_REQUIRED) {
					throw new MissingArgumentError(argument.name)
				} else if (argument.value === null || argument.value === undefined) {
					this.compiledValues.arguments[argument.name] = argument
				}
			}
		}

		// Iterate through input options and match them to
		// the defined options
		for (const option of input.options) {
			const definedOption = options[option.name]

			if (!definedOption) {
				throw new InvalidOptionError(option.name)
			}

			if (definedOption.mode === InputOption.VALUE_NONE) {
				if (!option.value.isNil && typeof option.value !== 'boolean') {
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
		if (Object.keys(this.compiledValues.options).length !== Object.keys(options).length) {
			for (const option of Object.values(options)) {
				if (option.mode === InputOption.VALUE_NONE) {
					continue
				}

				const compiledOption = this.compiledValues.options[option.name]

				if (compiledOption instanceof InputOption) {
					continue
				}

				if (option.mode === InputOption.VALUE_REQUIRED) {
					throw new MissingOptionError(option.name)
				}

				this.compiledValues.options[option.name] = option
			}
		}
	}

	execute(input: Input) {
		this._prepare(input)

		return this.ready().then(() => this.run())
	}

	_arguments() {
		if (!this.arguments) {
			return []
		}

		return this.arguments
	}

	_options() {
		if (!this.options) {
			return []
		}

		return this.options
	}

	execAsChildProcess(
		args: string[] | null | undefined = null,
		options: (BaseEncodingOptions & ExecFileOptions) | null | undefined = null,
	) {
		options = {
			env: process.env,
			...(options || {}),
		}

		if (!this.name) {
			throw new InvocationError(`Missing command name for ${this.constructor.name}`)
		}

		args = Array.isArray(args) ? Array.from(args) : []
		args.unshift(this.name)

		return new Promise((resolve, reject) => {
			ChildProcess.execFile(process.env.CLI_BIN as string, args, options, (err, stdout) => {
				if (err) {
					return reject(err)
				}

				resolve(stdout)
			})
		})
	}

	spawn(
		args: string[] | null | undefined = null,
		options: SpawnOptions | null | undefined = null,
	): SpawnedPromise<number> {
		options = {
			env: process.env,
			stdio: 'inherit',
			...(options || {}),
		}

		if (!this.name) {
			throw new InvocationError(`Missing command name for ${this.constructor.name}`)
		}

		args = Array.isArray(args) ? Array.from(args) : []
		args.unshift(this.name)

		const childProcess = ChildProcess.spawn(process.env.CLI_BIN as string, args, {
			stdio: 'inherit',
		})

		const promise = new Promise(resolve => {
			childProcess.on('close', code => {
				resolve(Number(code))
			})
		}) as SpawnedPromise<number>

		promise.childProcess = childProcess

		return promise
	}

	line(...messages: any[]) {
		this.cli.output.writeln(...messages)
	}

	info(...messages: any[]) {
		this.cli.output.writeln(`<info>${messages.shift()}</info>`, ...messages)
	}

	comment(...messages: any[]) {
		this.cli.output.writeln(`<comment>${messages.shift()}</comment>`, ...messages)
	}

	warn(...messages: any[]) {
		this.cli.output.writeln(`<warn>${messages.shift()}</warn>`, ...messages)
	}

	success(...messages: any[]) {
		this.cli.output.writeln(`<success>${messages.shift()}</success>`, ...messages)
	}

	error(...messages: any[]) {
		this.cli.output.writeln(`<error>${messages.shift()}</error>`, ...messages)
	}

	ask(question: string, defaultAnswer: any = null): Promise<string> {
		let prompt = `<question>${question}</question> `

		if (defaultAnswer !== null && defaultAnswer !== undefined) {
			prompt = `${prompt}<questionDefaultValue>[${defaultAnswer}]</questionDefaultValue> `
		}

		return new Promise(resolve => {
			const iface = readline.createInterface({
				input: process.stdin,
				output: process.stdout,
			})

			iface.question(this.output.formatter.format(prompt), answer => {
				iface.close()
				resolve((answer || defaultAnswer || '').trim())
			})
		})
	}

	confirm(question: string, defaultAnswer = true): Promise<boolean> {
		return this.ask(question, defaultAnswer ? 'yes' : 'no').then(answer => {
			if (answer.length === 0) {
				answer = String(defaultAnswer)
			}

			return cast.boolean(answer)
		})
	}
}
