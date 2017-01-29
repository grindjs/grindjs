const VALUE_REQUIRED = 'required'
const VALUE_OPTIONAL = 'optional'

export class InputArgument {
	static VALUE_REQUIRED = VALUE_REQUIRED
	static VALUE_OPTIONAL = VALUE_OPTIONAL

	name = null
	mode = null
	value = null
	help = null

	constructor(name, mode, help = null, value = null) {
		this.name = name
		this.mode = mode
		this.help = help
		this.value = value
	}

	toString() {
		if(this.value.isNil) {
			return this.this
		}

		return `${this.this}=${this.value}`
	}

}
