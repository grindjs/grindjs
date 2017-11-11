const acorn = require('acorn5-object-spread')
const base = require('acorn/dist/walk').base
const astring = require('astring')

export class AST {

	static parse(string) {
		return acorn.parse(string, {
			ecmaVersion: 9,
			plugins: {
				objectSpread: true
			}
		})
	}

	static walk(node, visitors) {
		(function c(node, st, override) {
			if(node.isNil) {
				// This happens during RestElement, unsure why.
				return
			}

			const type = override || node.type
			const found = visitors[type]

			if(found) {
				found(node, st)
			}

			base[type](node, st, c)
		})(node)
	}

	static walkVariables(node, callback) {
		if(node.type === 'ArrayPattern') {
			for(const element of node.elements) {
				this.walkVariables(element, callback)
			}
		} else if(node.type === 'ObjectPattern') {
			for(const property of node.properties) {
				if(property.type === 'RestElement') {
					callback(property.argument)
				} else {
					this.walkVariables(property.value, callback)
				}
			}
		} else if(node.type === 'AssignmentPattern') {
			this.walkVariables(node.left, callback)
		} else {
			callback(node)
		}
	}

	static stringify(tree) {
		return astring.generate(tree, {
			generator: {
				...astring.baseGenerator,
				Property(node, state) {
					if(node.type === 'SpreadElement') {
						state.write('...(')
						this[node.argument.type](node.argument, state)
						state.write(')')
						return
					}

					return astring.baseGenerator.Property.call(this, node, state)
				}
			}
		})
	}

}
