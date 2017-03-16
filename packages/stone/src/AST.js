const acorn = require('acorn')
const walk = require('acorn/dist/walk').simple
const astring = require('astring')

export class AST {

	static parse(string) {
		return acorn.parse(string)
	}

	static walk(node, visitors) {
		return walk(node, visitors)
	}

	static stringify(tree) {
		return astring(tree)
	}

}
