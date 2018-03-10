import './InputArgument'
import './InputOption'

export class Input {

	arguments = [ ]
	options = [ ]

	constructor(rawArgs) {
		const length = rawArgs.length

		for(let i = 0; i < length; i++) {
			const argument = rawArgs[i]

			if(!argument.startsWith('-')) {
				this.arguments.push(new InputArgument(new String(i), InputArgument.VALUE_OPTIONAL, null, argument))
				continue
			}

			const components = argument.split(/=/)

			if(components.length === 1) {
				this.options.push(new InputOption(components[0], InputOption.VALUE_NONE, null, true))
			} else {
				this.options.push(new InputOption(components[0], InputOption.VALUE_OPTIONAL, null, components[1]))
			}
		}
	}

	hasParameterOption(name) {
		return this.options.findIndex(option => option.name === name) >= 0
	}

}
