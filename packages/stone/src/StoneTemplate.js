import './Errors/StoneSyntaxError'

import './AST'
import './Support/contextualize'
import './Support/nextIndexOf'

const vm = require('vm')

export class StoneTemplate {
	compiler = null

	state = {
		file: null,
		contents: null,
		lines: null,
		index: 0
	}

	isLayout = false
	hasLayoutContext = false
	sections = [ ]

	expressions = [ ]
	spaceless = 0

	_template = null

	constructor(compiler, contents, file = null) {
		this.compiler = compiler
		this.state.contents = contents
		this.state.file = file

		const lines = contents.split(/\n/)
		const last = lines.length - 1
		let index = 0

		this.state.lines = lines.map((line, i) => {
			const length = line.length + (last === i ? 0 : 1)

			const range = {
				start: index,
				end: index + length,
				code: line,
				subsring: contents.substring(index, index + length)
			}

			index = range.end

			return range
		})
	}

	compile() {
		// Strip comments
		// TODO: This is going to break source maps
		let contents = this.state.contents.trim().replace(/\{\{--([\s\S]+)--\}\}/g, '')

		contents = contents.substring(this.advance(contents, 0)).trim()

		if(contents.length > 0) {
			this.expressions.push({
				type: 'string',
				contents: contents,
				index: this.state.index
			})
		}

		let code = ''

		for(const { type, contents, index } of this.expressions) {
			if(type === 'code') {
				code += `${contents}\n`
			} else {
				const output = this.finalizeOutput(contents, index)
				code += `output += ${output}\n`
			}
		}

		code = `function template(_, _sections = { }) {\nlet output = '';\n${code}\n`

		if(!this.isLayout) {
			code += 'return output;\n}'
		} else if(this.hasLayoutContext) {
			code += `return _.$engine._extends(__extendsLayout, Object.assign(_, __extendsContext), _sections);\n}`
		} else {
			code += `return _.$engine._extends(__extendsLayout, _, _sections);\n}`
		}

		let wrapped = `(function() { const t = ${contextualize(code)};`

		if(this.isLayout) {
			wrapped += 't.isLayout = true;'
		}

		wrapped += 'return t; })()'

		this._template = wrapped
	}

	advance(contents, index) {
		const match = contents.substring(index).match(/@(\w+)([ \t]*\()?\n*/)

		if(!match) {
			return index
		}

		match.index += index
		this.state.index = index

		if(match.index > index) {
			let string = contents.substring(index, match.index)

			if(string.trim().length > 0) {
				if(this.spaceless > 0) {
					string = string.replace(/>\s+</g, '><').trim()
				}

				this.expressions.push({
					type: 'string',
					contents: string,
					index: this.state.index
				})
			}

			index = match.index
			this.state.index = match.index
		}

		let args = null
		let nextIndex = match.index + match[0].length

		if(match[2]) {
			let openCount = -1
			let startIndex = index
			let lastIndex = index

			while(openCount !== 0 && (index = nextIndexOf(contents, [ '(', ')' ], index)) >= 0) {
				const parenthesis = contents.substring(index, index + 1)

				if(parenthesis === ')') {
					openCount--
				} else if(openCount === -1) {
					startIndex = index
					openCount = 1
				} else {
					openCount++
				}

				lastIndex = index
				index++
			}

			args = contents.substring(startIndex + 1, lastIndex)
			nextIndex = lastIndex + 1
		}

		const result = this.compiler.compileDirective(this, match[1].toLowerCase(), args)

		if(!result.isNil) {
			this.expressions.push({
				type: 'code',
				contents: result,
				index: match.index
			})
		}


		return this.advance(contents, nextIndex)
	}

	/**
	 * Finalizes an output block by replacing white space
	 * and converting output tags to placeholders for
	 * use within template literals
	 *
	 * @param  {string} output      Raw output
	 * @param  {number} sourceIndex Index in the source file this occurs
	 * @return {string}             Finalized output
	 */
	finalizeOutput(output, sourceIndex) {
		const placeholders = { }
		let placeholderOrdinal = 0

		// Store regular output blocks
		output = output.replace(/(^|[^@])\{\{\s*([\s\S]+?)\s*\}\}/gm, ($0, $1, $2) => {
			const placeholder = `@@__stone_placeholder_${++placeholderOrdinal}__@@`
			placeholders[placeholder] = `\${escape(${$2})}`
			return `${$1}${placeholder}`
		})

		// Strip escaped braces
		output = output.replace(/@\{\{([\s\S]+?)\}\}/gm, '{{$1}}')

		// Store raw output blocks
		output = output.replace(/\{!!\s*([\s\S]+?)\s*!!\}/gm, ($0, $1) => {
			const placeholder = `@@__stone_placeholder_${++placeholderOrdinal}__@@`
			placeholders[placeholder] = `\${${$1}}`
			return placeholder
		})

		// Escape escape characters
		output = output.replace(/\\/g, '\\\\')

		// Escape backticks
		output = output.replace(/`/g, '\\`')

		// Escape whitespace characters
		output = output.replace(/[\n]/g, '\\n')
		output = output.replace(/[\r]/g, '\\r')
		output = output.replace(/[\t]/g, '\\t')

		// Restore placeholders
		for(const [ placeholder, content ] of Object.entries(placeholders)) {
			// Content is returned as a function to avoid any processing
			// See https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/replace#Specifying_a_string_as_a_parameter
			output = output.replace(placeholder, () => content)
		}

		return this.validateSyntax(`\`${output}\`;`, sourceIndex)
	}

	findLineColumn(position) {
		let line = 0
		let column = 1

		for(const { start, end } of this.state.lines) {
			line++

			if(position >= end) {
				continue
			}

			column = (position - start) + 1
			break
		}

		return { line, column }
	}

	validateSyntax(code, position) {
		try {
			AST.parse(code)
		} catch(err) {
			if(err instanceof SyntaxError) {
				throw new StoneSyntaxError(this, err, position || this.state.index)
			}

			throw err
		}

		return code
	}

	toString() {
		if(typeof this._template !== 'string') {
			throw new Error('Templates must be compiled first.')
		}

		return this._template
	}

	toFunction() {
		const script = new vm.Script(`(${this.toString()})`, { filename: this.state.file })
		return script.runInNewContext()
	}

}
