import cast from 'as-type'

export type VALUE_MODE = 'none' | 'required' | 'optional'
const VALUE_NONE: VALUE_MODE = 'none'
const VALUE_REQUIRED: VALUE_MODE = 'required'
const VALUE_OPTIONAL: VALUE_MODE = 'optional'

export class InputOption {
	static VALUE_NONE = VALUE_NONE
	static VALUE_REQUIRED = VALUE_REQUIRED
	static VALUE_OPTIONAL = VALUE_OPTIONAL

	value: any

	constructor(
		public name: string,
		public mode: VALUE_MODE,
		public help: string | null | undefined = null,
		value: any = null,
	) {
		this.help = help
		this.value = mode === VALUE_NONE ? cast.boolean(value) : value

		if (name.startsWith('--')) {
			this.name = name.substring(2)
		} else if (name.startsWith('-')) {
			this.name = name.substring(1)
		}
	}

	toString() {
		if (this.value === null || this.value === null) {
			return this.name
		}

		return `${this.name}=${this.value}`
	}
}
