import './AST'
import './HtmlString'

const he = require('he')

export class Template {

	/**
	 * Finds the next index of a set of characters
	 *
	 * @param  {string}    string    String to search in
	 * @param  {array|set} set       Array or set of characters to search for
	 * @param  {number}    fromIndex Index to search from
	 * @return {number}              Index of the parenthesis or -1
	 */
	static nextIndexOf(string, set, fromIndex) {
		let index = null

		for(const character of set) {
			const characterIndex = string.indexOf(character, fromIndex)

			if(characterIndex === -1) {
				continue
			}

			if(index === null) {
				index = characterIndex
			}

			index = Math.min(index, characterIndex)
		}

		if(index === null) {
			return -1
		}

		return index
	}

	/**
	 * Finds the next index of an
	 * opening or closing parenthesis
	 *
	 * @param  {string} string    String to search in
	 * @param  {number} fromIndex Index to search from
	 * @return {number}           Index of the parenthesis or -1
	 */
	static nextIndexOfParenthesis(string, fromIndex) {
		return this.nextIndexOf(string, [ '(', ')' ], fromIndex)
	}

	/**
	 * Sanitizes a block of HTML by replacing white space
	 * and converting output tags to placeholders for
	 * use within template literals
	 *
	 * @param  {string} html Raw HTML
	 * @return {string}      Sanitized HTML
	 */
	static sanitizeHtml(html) {
		const placeholders = { }
		let placeholderOrdinal = 0

		// Store regular output blocks
		html = html.replace(/(^|[^@])\{\{\s*(.+?)\s*\}\}/g, ($0, $1, $2) => {
			const placeholder = `@@__stone_placeholder_${++placeholderOrdinal}__@@`
			placeholders[placeholder] = `\${escape(${$2})}`
			return `${$1}${placeholder}`
		})

		// Strip escaped braces
		html = html.replace(/@\{\{(.+?)\}\}/g, '{{$1}}')

		// Store raw output blocks
		html = html.replace(/\{!!\s*(.+?)\s*!!\}/g, ($0, $1) => {
			const placeholder = `@@__stone_placeholder_${++placeholderOrdinal}__@@`
			placeholders[placeholder] = `\${${$1}}`
			return placeholder
		})

		// Escape escape characters
		html = html.replace(/\\/g, '\\\\')

		// Escape backticks
		html = html.replace(/`/g, '\\`')

		// Escape whitespace characters
		html = html.replace(/[\n]/g, '\\n')
		html = html.replace(/[\r]/g, '\\r')
		html = html.replace(/[\t]/g, '\\t')

		// Restore placeholders
		for(const [ placeholder, content ] of Object.entries(placeholders)) {
			html = html.replace(placeholder, content)
		}

		return html
	}

	/**
	 * Escapes a string to avoid XSS issues when
	 * outputting to HTML.
	 *
	 * @param  {mixed} value Unsafe value
	 * @return {string}      Escaped string
	 */
	static escape(value) {
		if(value.isNil) {
			return ''
		}

		if(value instanceof HtmlString) {
			return value.toString()
		}

		return he.encode(value.toString(), {
			useNamedReferences: true
		})
	}

	/**
	 * Runs through the template code and prefixes
	 * any non-local variables with the context
	 * object.
	 *
	 * @param  {string} code Code for the template
	 * @return {string}      Contextualized template code
	 */
	static contextualize(code) {
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

		const checkScope = fromNode => {
			while(fromNode.start >= scope.end && scopes.length > 1) {
				scopes.pop()
				scope = scopes[scopes.length - 1]
			}
		}

		const pushScope = node => {
			checkScope(node)

			scope = {
				locals: new Set(scope.locals),
				node: node,
				end: node.end
			}

			scopes.push(scope)
		}

		const addVariable = node => {
			if(node.type === 'ArrayPattern') {
				for(const element of node.elements) {
					addVariable(element)
				}
			} else if(node.type === 'ObjectPattern') {
				for(const property of node.properties) {
					addVariable(property.value)
				}
			} else {
				scope.locals.add(node.name)
			}
		}

		AST.walk(tree, {
			Statement: node => {
				checkScope(node)
			},

			BlockStatement: node => pushScope(node),
			ForStatement: node => pushScope(node),
			ForOfStatement: node => pushScope(node),
			WhileStatement: node => pushScope(node),

			ArrowFunctionExpression: node => {
				pushScope(node)

				for(const parameter of node.params) {
					addVariable(parameter)
				}
			},

			FunctionExpression: node => {
				pushScope(node)

				for(const parameter of node.params) {
					addVariable(parameter)
				}
			},

			VariableDeclarator: node => {
				checkScope(node)

				addVariable(node.id)
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
				checkScope(node)

				if(node.shouldntContextualize || scope.locals.has(node.name)) {
					return
				}

				node.name = `_.${node.name}`
			}
		})

		return AST.stringify(tree)
	}

}
