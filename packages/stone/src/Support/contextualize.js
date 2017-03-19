import '../AST'

/**
 * Runs through the template code and prefixes
 * any non-local variables with the context
 * object.
 *
 * @param  {string} code Code for the template
 * @return {string}      Contextualized template code
 */
export function contextualize(code) {
	let tree = null

	try {
		tree = AST.parse(code)
	} catch(err) {
		err._code = code
		throw err
	}

	const scopes = [
		{
			locals: new Set([
				'_',
				'_sections',
				'Object',
				'Set',
				'Date',
				'Array',
				'String',
				'global',
				'process'
			]),
			end: Number.MAX_VALUE
		}
	]

	let scope = scopes[0]

	const processStatement = node => {
		scope = pushScope(scopes, node)
	}

	AST.walk(tree, {
		Statement: node => {
			scope = checkScope(scopes, node)
		},

		BlockStatement: processStatement,
		ForStatement: processStatement,
		ForOfStatement: processStatement,
		WhileStatement: processStatement,

		ArrowFunctionExpression: node => {
			scope = pushScope(scopes, node)

			for(const parameter of node.params) {
				scopeVariable(scope, parameter)
			}
		},

		FunctionExpression: node => {
			scope = pushScope(scopes, node)

			for(const parameter of node.params) {
				scopeVariable(scope, parameter)
			}
		},

		VariableDeclarator: node => {
			scope = checkScope(scopes, node)

			scopeVariable(scope, node.id)
		},

		ObjectExpression: node => {
			for(const property of node.properties) {
				if(property.shorthand !== true) {
					continue
				}

				property.shorthand = false
				property.key = new property.key.constructor({ options: { } })
				property.key.shouldntContextualize = true
				Object.assign(property.key, property.value)

				if(property.key.name.startsWith('_.')) {
					property.key.name = property.key.name.substring(2)
				}
			}
		},

		Identifier: node => {
			scope = checkScope(scopes, node)

			if(node.shouldntContextualize || scope.locals.has(node.name)) {
				return
			}

			node.name = `_.${node.name}`
		}
	})

	return AST.stringify(tree)
}

/**
 * Walks through each variable in the node,
 * including destructured, and adds them to
 * the current scope
 *
 * @param  {object} scope Scope to add through
 * @param  {object} node  Node to add
 */
function scopeVariable(scope, node) {
	AST.walkVariables(node, node => {
		scope.locals.add(node.name)
	})
}

/**
 * Checks if the current scope is still active
 *
 * @param  {[object]} scopes   Stack of scopes
 * @param  {object}   fromNode Node that’s checking scope
 * @return {object}            Current scaope
 */
function checkScope(scopes, fromNode) {
	let scope = scopes[scopes.length - 1]

	while(fromNode.start >= scope.end && scopes.length > 1) {
		scopes.pop()
		scope = scopes[scopes.length - 1]
	}

	return scope
}

/**
 * Pushes a new scope on stack
 *
 * @param  {[object]} scopes Stack of scopes
 * @param  {object}   node   Node that’s creating this scope
 * @return {object}          New scope
 */
function pushScope(scopes, node) {
	checkScope(scopes, node)

	const scope = {
		locals: new Set(scopes[scopes.length - 1].locals),
		node: node,
		end: node.end
	}

	scopes.push(scope)
	return scope
}
