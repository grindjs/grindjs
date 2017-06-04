import '../AST'

export function compileMacro(context, args) {
	args = context.parseArguments(args)

	const name = AST.stringify(args.shift())
	args = args.map(arg => AST.stringify(arg)).join(', ')

	let code = `_[${name}] = function(${args}) {`
	code += '\n_ = Object.assign({ }, _);'
	code += '\nlet output = \'\';'

	return code
}

export function compileEndmacro() {
	return 'return new HtmlString(output);\n};'
}
