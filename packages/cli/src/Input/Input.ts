import { InputArgument } from './InputArgument'
import { InputOption } from './InputOption'

export class Input {
	arguments: InputArgument[] = []
	options: InputOption[] = []

	constructor(rawArgs: string[]) {
		const { length } = rawArgs

		for (let i = 0; i < length; i++) {
			const argument = rawArgs[i]

			if (!argument.startsWith('-')) {
				this.arguments.push(
					new InputArgument(i.toString(), InputArgument.VALUE_OPTIONAL, null, argument),
				)
				continue
			}

			const components = argument.split(/=/)

			if (components.length === 1) {
				this.options.push(
					new InputOption(components[0], InputOption.VALUE_NONE, null, true),
				)
			} else {
				this.options.push(
					new InputOption(components[0], InputOption.VALUE_OPTIONAL, null, components[1]),
				)
			}
		}
	}

	hasParameterOption(name: string) {
		return this.options.findIndex(option => option.name === name) >= 0
	}
}
