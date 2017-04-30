import '../Errors/StoneCompilerError'

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

/**
 * Increases the spaceless level
 *
 * @param  {object} context Context for the compilation
 */
export function compileSpaceless(context) {
	context.spaceless++
}

/**
 * Decreases the spaceless level
 *
 * @param  {object} context Context for the compilation
 */
export function compileEndspaceless(context) {
	context.spaceless--

	if(context.spaceless < 0) {
		throw new StoneCompilerError(context, 'Unbalanced calls to @endspaceless')
	}
}
