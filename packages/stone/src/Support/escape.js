import '../HtmlString'

const he = require('he')

/**
 * Escapes a string to avoid XSS issues when
 * outputting to HTML.
 *
 * @param  {mixed} value Unsafe value
 * @return {string}      Escaped string
 */
export function escape(value) {
	if(value.isNil) {
		return ''
	}

	if(value instanceof HtmlString) {
		return value.toString()
	}

	return he.encode(value.toString(), {
		useNamedReferences: true
	})
}
