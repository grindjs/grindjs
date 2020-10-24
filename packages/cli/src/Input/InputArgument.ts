export type VALUE_MODE = 'required' | 'optional'
const VALUE_REQUIRED: VALUE_MODE = 'required'
const VALUE_OPTIONAL: VALUE_MODE = 'optional'

export class InputArgument {
	static VALUE_REQUIRED = VALUE_REQUIRED
	static VALUE_OPTIONAL = VALUE_OPTIONAL

	constructor(
		public name: string,
		public mode: VALUE_MODE,
		public help: string | null | undefined = null,
		public value: string | null | undefined = null,
	) {}

	toString() {
		if (this.value === null || this.value === null) {
			return this.name
		}

		return `${this.name}=${this.value}`
	}
}
