const acorn = require('acorn')
const base = require('acorn/dist/walk').base
const astring = require('astring')

export class AST {

	static parse(string) {
		return acorn.parse(string)
	}

	static walk(node, visitors) {
		(function c(node, st, override) {
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
				this.walkVariables(property.value, callback)
			}
		} else {
			callback(node)
		}
	}

	static stringify(tree) {
		return astring(tree)
	}

}
