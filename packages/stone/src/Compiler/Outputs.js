/**
 * Displays the contents of an object or value
 *
 * @param  {object} context Context for the compilation
 * @param  {mixed}  value   Object or value to display
 * @return {string} Code to display the contents
 */
export function compileDump(context, value) {
	context.validateSyntax(value)
	return `output += \`<pre>\${escape(stringify(${value}, null, '  '))}</pre>\``
}
