import '../AST'
import '../Errors/StoneCompilerError'

export function compileComponent(context, args) {
	args = context.parseArguments(args)

	let code = 'output += (function() {'
	code += `\nconst __componentView = ${AST.stringify(args[0])};`

	if(args.length > 1) {
		code += `\nconst __componentContext = ${AST.stringify(args[1])};`
	} else {
		code += '\nconst __componentContext = { };'
	}

	code += '\nlet output = \'\';'

	return code
}

export function compileEndcomponent() {
	const context = 'Object.assign({ slot: new HtmlString(output) }, __componentContext)'
	return `return _.$stone.include(_, { }, __templatePathname, __componentView, ${context});\n})()`
}

export function compileSlot(context, args) {
	args = context.parseArguments(args)

	if(args.length === 1) {
		return `__componentContext[${AST.stringify(args[0])}] = (function() {\nlet output = '';`
	}

	if(args.length !== 2) {
		throw new StoneCompilerError(context, 'Invalid slot')
	}

	return `__componentContext[${AST.stringify(args[0])}] = escape(${AST.stringify(args[1])});`
}

export function compileEndslot() {
	return 'return new HtmlString(output); })()'
}
