const VALUE_NONE = 'none'
const VALUE_REQUIRED = 'required'
const VALUE_OPTIONAL = 'optional'

const cast = require('as-type')

export class InputOption {
	static VALUE_NONE = VALUE_NONE
	static VALUE_REQUIRED = VALUE_REQUIRED
	static VALUE_OPTIONAL = VALUE_OPTIONAL

	name = null
	mode = null
	value = null
	help = null

	constructor(name, mode, help = null, value = null) {
		this.mode = mode
		this.help = help
		this.value = mode === VALUE_NONE ? cast.boolean(value) : value

		if(name.startsWith('--')) {
			this.name = name.substring(2)
		} else if(name.startsWith('-')) {
			this.name = name.substring(1)
		} else {
			this.name = name
		}
	}

	toString() {
		if(this.value.isNil) {
			return this.this
		}

		return `${this.this}=${this.value}`
	}

}
