import '../Command'
import '../Input/InputOption'
import '../Input/InputArgument'

export class HelpCommand extends Command {
	command = null
	options = [ new InputOption('h', InputOption.VALUE_OPTIONAL) ]

	constructor(app, cli, command) {
		super(app, cli)

		this.command = command
	}

	run() {
		const args = this.command._arguments()
		const options = this.command._options().concat(this.command.defaultOptions)

		let usage = `  ${this.command.name}`

		if(options.length > 1) { // All commands have --help
			usage += ' [options]'
		}

		if(args.length > 0) {
			for(const argument of args) {
				if(argument.mode === InputArgument.VALUE_REQUIRED) {
					usage += ` <${argument.name}>`
				} else {
					usage += ` <${argument.name}?>`
				}
			}
		}

		this.line('<groupTitle>Usage:</groupTitle>')
		this.line(usage)

		const groups = { }
		let maxNameLength = 10

		if(args.length > 0) {
			groups.Arguments = [ ]

			for(const argument of args) {
				maxNameLength = Math.max(maxNameLength, argument.name.length + 4)
				groups.Arguments.push([ argument.name, argument.help, argument.value ])
			}
		}

		if(options.length > 0) {
			groups.Options = [ ]

			for(const option of options) {
				let name = `--${option.name}`

				if(option.mode !== InputOption.VALUE_NONE) {
					name += `[=${option.name.toUpperCase()}]`
				}

				maxNameLength = Math.max(maxNameLength, name.length + 4)
				groups.Options.push([ name, option.help, option.value ])
			}
		}

		for(const [ title, infos ] of Object.entries(groups)) {
			this.line('')
			this.line(`<groupTitle>${title}:</groupTitle>`)

			for(const info of infos) {
				let line = `<groupItem>${info[0].padEnd(maxNameLength, ' ')}</groupItem>`
				const hasHelp = !info[1].isNil && info[1].length > 0

				if(hasHelp) {
					line += `<groupItemHelp>${info[1]}</groupItemHelp>`
				}

				if(!info[2].isNil && info[2].length > 0) {
					if(hasHelp) {
						line += ' '
					}

					line += `<groupItemValue>[default: ‘${info[2]}’]</groupItemValue>`
				}

				this.line(`  ${line}`)
			}
		}

		if(!this.command.description.isNil) {
			this.line('')
			this.line('<groupTitle>Help:</groupTitle>')
			this.line(`  <groupItemHelp>${this.command.description}</groupItemHelp>`)
		}
	}

}
