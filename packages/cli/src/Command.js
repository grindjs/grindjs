export class Command {
	app = null
	cli = null

	name = null
	description = null
	arguments = [ ]
	options = { }

	compiledValues = {
		arguments: { },
		options: { }
	}

	constructor(app, cli) {
		this.app = app
		this.cli = cli
	}

	argument(name) {
		return this.compiledValues.arguments[name]
	}

	option(name) {
		return this.compiledValues.options[name]
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

		var usage = [ ]
		const options = Object.entries(this.options)

		if(options.length > 0) {
			usage.push('[options]')

			for(const option of options) {
				command.option('--' + option[0], option[1])
			}
		}

		for(const argument of this.arguments) {
			usage.push('<' + argument + '>')
		}

		command.usage(usage)
		command.action((...args) => this._execute(...args))

		return command
	}

	_execute(...args) {
		const cli = args.pop()

		if(args.length < this.arguments.length) {
			this.error(
				'Not enough arguments, missing: %s',
				this.arguments.slice(args.length).join(', ')
			)

			process.exit(1)
		}

		for(const i in args) {
			this.compiledValues.arguments[this.arguments[i]] = args[i]
		}

		for(const option of Object.keys(this.options)) {
			this.compiledValues.options[option] = cli[option] || false
		}

		process.title = 'node ' + this.name

		this.ready()
		.then(() => this.run())
		.then(() => process.exit(0))
		.catch(err => {
			this.error(err.message, err.stack)
			process.exit(1)
		})
	}

}
