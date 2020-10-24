import Application from '@grindjs/framework/src'

import { Cli } from '../Cli'
import { Command } from '../Command'
import { InputArgument } from '../Input/InputArgument'
import { InputOption } from '../Input/InputOption'

type HelpTuple = [string, string | null | undefined, string | null | undefined]

export class HelpCommand extends Command {
	options = [new InputOption('h', InputOption.VALUE_OPTIONAL)]

	constructor(app: Application, cli: Cli, public command: Command) {
		super(app, cli)
	}

	run() {
		const args = this.command._arguments()
		const options = this.command._options().concat(this.command.defaultOptions)

		let usage = `  ${this.command.name}`

		if (options.length > 1) {
			// All commands have --help
			usage += ' [options]'
		}

		if (args.length > 0) {
			for (const argument of args) {
				if (argument.mode === InputArgument.VALUE_REQUIRED) {
					usage += ` <${argument.name}>`
				} else {
					usage += ` <${argument.name}?>`
				}
			}
		}

		this.line('<groupTitle>Usage:</groupTitle>')
		this.line(usage)

		const groups: {
			Arguments?: HelpTuple[]
			Options?: HelpTuple[]
		} = {}
		let maxNameLength = 10

		if (args.length > 0) {
			groups.Arguments = []

			for (const argument of args) {
				maxNameLength = Math.max(maxNameLength, argument.name.length + 4)
				groups.Arguments.push([argument.name, argument.help, argument.value])
			}
		}

		if (options.length > 0) {
			groups.Options = []

			for (const option of options) {
				let name = `--${option.name}`

				if (option.mode !== InputOption.VALUE_NONE) {
					name += `[=${option.name.toUpperCase()}]`
				}

				maxNameLength = Math.max(maxNameLength, name.length + 4)
				groups.Options.push([name, option.help, option.value])
			}
		}

		for (const [title, infos] of Object.entries(groups)) {
			this.line('')
			this.line(`<groupTitle>${title}:</groupTitle>`)

			for (const info of infos ?? []) {
				let line = `<groupItem>${info[0].padEnd(maxNameLength, ' ')}</groupItem>`
				const hasHelp = typeof info[1] === 'string' && info[1].length > 0

				if (hasHelp) {
					line += `<groupItemHelp>${info[1]}</groupItemHelp>`
				}

				if (typeof info[2] === 'string' && info[2].length > 0) {
					if (hasHelp) {
						line += ' '
					}

					line += `<groupItemValue>[default: ‘${info[2]}’]</groupItemValue>`
				}

				this.line(`  ${line}`)
			}
		}

		if (typeof this.command.description === 'string') {
			this.line('')
			this.line('<groupTitle>Help:</groupTitle>')
			this.line(`  <groupItemHelp>${this.command.description}</groupItemHelp>`)
		}
	}
}
