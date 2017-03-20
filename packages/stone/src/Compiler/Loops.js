import '../AST'
import '../Errors/StoneSyntaxError'

export function compileFor(context, args) {
	context.loopStack = context.loopStack || [ ]

	args = `for(${args}) {`
	let tree = null

	try {
		tree = AST.parse(`${args} }`)
	} catch(err) {
		if(err instanceof SyntaxError) {
			throw new StoneSyntaxError(context, err, context.state.index)
		}

		throw err
	}

	if(tree.body.length > 1 || (tree.body[0].type !== 'ForInStatement' && tree.body[0].type !== 'ForOfStatement'))  {
		context.loopStack.push(false)
		return args
	}

	const node = tree.body[0]
	const lhs = AST.stringify(node.left).trim().replace(/;$/, '')
	let rhs = AST.stringify(node.right).trim().replace(/;$/, '')

	if(node.type === 'ForInStatement') {
		rhs = `new StoneLoop(Object.keys(${rhs}))`
	} else {
		rhs = `new StoneLoop(${rhs})`
	}

	context.loops = context.loops || 0
	context.loopVariableStack = context.loopVariableStack || [ ]

	const loopVariable = `__loop${context.loops++}`
	context.loopVariableStack.push(loopVariable)
	context.loopStack.push(true)

	let code = `const ${loopVariable} = ${rhs};\n`
	code += `${loopVariable}.depth = ${context.loopVariableStack.length};\n`

	if(context.loopStack.length > 1) {
		code += `${loopVariable}.parent = ${context.loopVariableStack[context.loopVariableStack.length - 2]};\n`
	}

	code += `for(${lhs} of ${loopVariable}) {\n`
	code += `\tconst loop = ${loopVariable};`

	return code
}

export function compileForeach(context, args) {
	// No difference between for and foreach
	// Included for consistency with Blade
	return this.compileFor(context, args)
}

export function compileEndfor(context) {
	if(context.loopStack.pop()) {
		context.loopVariableStack.pop()
	}

	return this.compileEnd(context)
}

export function compileEndforeach(context) {
	// No difference between for and foreach
	// Included for consistency with Blade
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

	context.validateSyntax(condition)
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

	context.validateSyntax(condition)
	return `if(${condition}) { break; }`
}

export function compileWhile(context, condition) {
	context.validateSyntax(condition)
	return `while(${condition}) {`
}

export function compileEndwhile(context) {
	return this.compileEnd(context)
}
