import '../AST'
import '../Template'

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
		return `${args};`
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

	while(openCount() !== 0 && (index = Template.nextIndexOf(args, set, index)) >= 0) {
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
		return `${lhs};`
	}

	// If var type has been explicitly defined, we’ll
	// pass through directly and scope locally
	if(lhs.startsWith('const ') || lhs.startsWith('let ')) {
		return `${lhs} = ${rhs};`
	}

	// Otherwise, scoping is assumed to be on the context var
	if(lhs[0] !== '{' && lhs[0] !== '[') {
		// If we‘re not destructuring, we can just assign it
		// directly on the context var and bail out early
		return `_.${lhs} = ${rhs};`
	}

	// If we are destructuring, we need to find the vars to extract
	// then wrap them in a function and assign them to the context var
	const code = `const ${lhs} = ${rhs};`
	const tree = AST.parse(code)
	const extracted = [ ]

	if(tree.body.length > 1 || tree.body[0].type !== 'VariableDeclaration')  {
		throw new Error('Unexpected variable assignment.')
	}

	const extract = node => {
		if(node.type === 'ArrayPattern') {
			for(const element of node.elements) {
				extract(element)
			}
		} else if(node.type === 'ObjectPattern') {
			for(const property of node.properties) {
				extract(property.value)
			}
		} else {
			extracted.push(node.name)
		}
	}

	for(const declaration of tree.body[0].declarations) {
		extract(declaration.id)
	}

	return `Object.assign(_, (function() {\n\t${code}\n\treturn { ${extracted.join(', ')} };\n})());`
}
