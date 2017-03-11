import { encodeHTML } from 'entities'

const acorn = require('acorn')
acorn.walk = require('acorn/dist/walk').simple

const astring = require('astring')

export class Template {

	/**
	 * Finds the next index of an
	 * opening or closing parenthesis
	 *
	 * @param  {string} string    String to search in
	 * @param  {number} fromIndex Index to search from
	 * @return {number}           Index of the parenthesis or -1
	 */
	static nextIndexOfParenthesis(string, fromIndex) {
		const open = string.indexOf('(', fromIndex)
		const close = string.indexOf(')', fromIndex)

		if(open === -1) {
			return close
		} else if(close === -1)  {
			return open
		}

		return Math.min(open, close)
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
		html = html.replace(/(^|[^@])\{\{\s*(.+?)\s*\}\}/g, '$1${escape($2)}')
		html = html.replace(/\{!!\s*(.+?)\s*!!\}/g, '${$1}')
		html = html.replace(/[\n]/g, '\\n')
		html = html.replace(/[\r]/g, '\\r')
		html = html.replace(/[\t]/g, '\\t')

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

		return encodeHTML(value.toString())
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
			tree = acorn.parse(code)
		} catch(err) {
			err._code = code
			throw err
		}

		const scopes = [
			{
				locals: new Set([ '_sections' ]),
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

		acorn.walk(tree, {
			Statement: node => {
				checkScope(node)
			},

			BlockStatement: node => {
				checkScope(node)

				scope = {
					locals: new Set(scope.locals),
					node: node,
					end: node.end
				}

				scopes.push(scope)
			},

			VariableDeclarator: node => {
				checkScope(node)
				scope.locals.add(node.id.name)
			},

			Identifier: node => {
				checkScope(node)

				if(scope.locals.has(node.name)) {
					return
				}

				node.name = `_.${node.name}`
			}
		})

		return astring(tree)
	}

}
