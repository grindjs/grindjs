import '../AST'
import '../Errors/StoneCompilerError'
import '../Errors/StoneSyntaxError'
import '../Support/nextIndexOf'

/**
 * Sets a context variable
 *
 * @param  {object} context Context for the compilation
 * @param  {string} args    Arguments to set
 * @return {string} Code to set the context variable
 */
export function compileSet(context, args) {
	if(args.indexOf(',') === -1) {
		// If there’s no commas, this is a simple raw code block
		return context.validateSyntax(`${args};`)
	}

	// If there are commas, we need to determine if
	// the comma is at the top level or if it‘s inside
	// an object, array or function call to determine
	// the intended behavior
	const open = {
		'[': 0,
		'(': 0,
		'{': 0,
		first: true
	}

	const openCount = () => {
		if(open.first) {
			delete open.first
			return -1
		}

		return Object.values(open).reduce((a, b) => a + b, 0)
	}

	const set = [ '(', ')', '{', '}', '[', ']', ',' ]
	let index = 0

	while(openCount() !== 0 && (index = nextIndexOf(args, set, index)) >= 0) {
		const character = args.substring(index, index + 1)

		switch(character) {
			case '(':
				open['(']++
				break
			case ')':
				open['(']--
				break
			case '{':
				open['{']++
				break
			case '}':
				open['{']--
				break
			case '[':
				open['[']++
				break
			case ']':
				open['[']--
				break
			default:
				break
		}

		index++

		if(character === ',' && openCount() === 0) {
			break
		}
	}

	const lhs = args.substring(0, index).trim().replace(/,$/, '')
	const rhs = args.substring(index).trim().replace(/^,/, '')

	if(rhs.length === 0) {
		return context.validateSyntax(`${lhs};`)
	}

	// If var type has been explicitly defined, we’ll
	// pass through directly and scope locally
	if(lhs.startsWith('const ') || lhs.startsWith('let ')) {
		return context.validateSyntax(`${lhs} = ${rhs};`)
	}

	// Otherwise, scoping is assumed to be on the context var
	if(lhs[0] !== '{' && lhs[0] !== '[') {
		// If we‘re not destructuring, we can assign it directly
		// and bail out early.
		//
		// `__auto_scope_` will be processed by `contextualize` to
		// determine whether or not the var should be set on the
		// global `_` context or if there is a variable within the
		// scope with the same name as `lhs`

		return context.validateSyntax(`__auto_scope_${lhs} = ${rhs};`)
	}

	// If we are destructuring, we need to find the vars to extract
	// then wrap them in a function and assign them to the context var
	const code = `const ${lhs} = ${rhs};`
	let tree = null

	try {
		tree = AST.parse(code)
	} catch(err) {
		if(err instanceof SyntaxError) {
			throw new StoneSyntaxError(context, err, context.state.index)
		}

		throw err
	}

	const extracted = [ ]

	if(tree.body.length > 1 || tree.body[0].type !== 'VariableDeclaration')  {
		throw new StoneCompilerError(context, 'Unexpected variable assignment.')
	}

	for(const declaration of tree.body[0].declarations) {
		AST.walkVariables(declaration.id, node => extracted.push(node.name))
	}

	return `Object.assign(_, (function() {\n\t${code}\n\treturn { ${extracted.join(', ')} };\n})());`
}
