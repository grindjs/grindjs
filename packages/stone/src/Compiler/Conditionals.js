export function compileIf(context, condition) {
	context.validateSyntax(condition)
	return `if(${condition}) {`
}

export function compileElseif(context, condition) {
	context.validateSyntax(condition)
	return `} else if(${condition}) {`
}

export function compileElse() {
	return '} else {'
}

export function compileEndif(context) {
	return this.compileEnd(context)
}

export function compileUnless(context, condition) {
	context.validateSyntax(condition)
	return `if(!${condition}) {`
}

export function compileEndunless(context) {
	return this.compileEnd(context)
}
