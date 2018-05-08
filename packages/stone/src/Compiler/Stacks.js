import '../AST'
import '../Errors/StoneCompilerError'

export function compileStack(context, name) {
	context.validateSyntax(name)
	return `output += _.$stone.stackRender(_, ${name})`
}

export function _compileStackOperation(context, operation, args) {
	const compile = `_compile${operation[0].toUpperCase()}${operation.substring(1)}`
	args = context.parseArguments(args)

	if(args.length === 1) {
		args = AST.stringify(args[0])
		return this[compile](context, args, '(function() {\nlet output = \'\';')
	}

	if(args.length !== 2) {
		throw new StoneCompilerError(context, `Invalid ${operation} block`)
	}

	return this[compile](
		context,
		AST.stringify(args[0]),
		`escape(${AST.stringify(args[1])}));`
	)
}

export function compilePush(context, args) {
	return this._compileStackOperation(context, 'push', args)
}

export function _compilePush(context, name, code) {
	return `_.$stone.stackPush(_, ${name}, ${code}`
}

export function compilePrepend(context, args) {
	return this._compileStackOperation(context, 'prepend', args)
}

export function _compilePrepend(context, name, code) {
	return `_.$stone.stackPrepend(_, ${name}, ${code}`
}

export function compileEndpush() {
	return 'return new HtmlString(output);\n})());'
}

export function compileEndprepend() {
	return this.compileEndpush()
}
