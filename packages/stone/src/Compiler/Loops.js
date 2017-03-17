export function compileFor(context, args) {
	return `for(${args}) {`
}

export function compileEndfor(context) {
	return this.compileEnd(context)
}

/**
 * Generate continue code that optionally has a condition
 * associated with it.
 *
 * @param  {object} context   Context for the compilation
 * @param  {string} condition Optional condition to continue on
 * @return {string}           Code to continue
 */
export function compileContinue(context, condition) {
	if(condition.isNil) {
		return 'continue;'
	}

	return `if(${condition}) { continue; }`
}

/**
 * Generate break code that optionally has a condition
 * associated with it.
 *
 * @param  {object} context   Context for the compilation
 * @param  {string} condition Optional condition to break on
 * @return {string}           Code to break
 */
export function compileBreak(context, condition) {
	if(condition.isNil) {
		return 'break;'
	}

	return `if(${condition}) { break; }`
}

export function compileWhile(context, condition) {
	return `while(${condition}) {`
}

export function compileEndwhile(context) {
	return this.compileEnd(context)
}
