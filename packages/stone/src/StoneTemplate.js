/* eslint-disable max-lines */
import './Errors/StoneSyntaxError'
import './Errors/StoneCompilerError'

import './AST'
import './Support/contextualize'
import './Support/nextIndexOf'
import './Support/nextClosingIndexOf'

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
		let contents = this.state.contents.trim().replace(/\{\{--([\s\S]+?)--\}\}/g, '')

		// Parse through the template
		contents = contents.substring(this.advance(contents, 0)).trim()

		// If there’s anything left in `contents` after parsing is done
		// append is as an output string
		if(contents.trim().length > 0) {
			this.addOutputExpression(this.state.index, contents)
		}

		let code = ''

		// Loop through the expressions and add the code
		for(const { type, contents } of this.expressions) {
			if(type !== 'code') {
				throw new Error('Unsupported type')
			}

			code += `${contents.trim()}\n`
		}

		// Determine correct return value for the template:
		// * For non-layout templates it’s the `output` var
		// * For templates that extend a layout, it’s calling the parent layout
		let returns = null

		if(!this.isLayout) {
			returns = 'output'
		} else {
			let context = '_'

			if(this.hasLayoutContext) {
				// If `@extends` was called with a second context
				// parameter, we assign those values over the
				// current context
				context = 'Object.assign(_, __extendsContext)'
			}

			returns = `_.$stone.extends(__templatePathname, __extendsLayout, ${context}, _sections)`
		}

		// Wrap the compiled code in a template func with it’s return value
		const template = `function template(_, _sections = { }) {\nlet output = '';const __templatePathname = '${this.state.file}';\n${code}\nreturn ${returns};\n}`

		// Contextualize the template so all global vars are prefixed with `_.`
		const contextualized = contextualize(template)

		// Take the contextualized template and wrap it in function
		// that will be called immediately.  This enables us to set
		// properties on the template function
		let wrapped = `(function() { const t = ${contextualized};`

		if(this.isLayout) {
			wrapped += 't.isLayout = true;'
		}

		wrapped += 'return t; })()'

		this._template = wrapped
	}

	/**
	 * Parses contents to the next directive
	 * Recursive and will continue calling itself
	 * until there are no more directives to parse.
	 *
	 * @param  string contents Template to parse
	 * @param  number index    Current position
	 * @return number          End position
	 */
	advance(contents, index) {
		// Find the next @ index (indicating a directive) that occurs
		// outside of an output block
		const set = [ '@', '{{', '{!!' ]
		let startIndex = index

		while(startIndex >= 0 && startIndex + 1 < contents.length) {
			startIndex = nextIndexOf(contents, set, startIndex)

			// Break if we’ve found an @ char or if we’re at
			// the end of the road
			if(startIndex === -1 || contents[startIndex] !== '{') {
				break
			}

			if(contents[startIndex + 1] === '{') {
				startIndex = nextClosingIndexOf(contents, '{{', '}}', startIndex)
			} else {
				startIndex = nextClosingIndexOf(contents, '{!!', '!!}', startIndex)
			}
		}

		if(startIndex === -1) {
			// If we haven’t matched anything, we can bail out
			return index
		}

		const match = contents.substring(startIndex).match(/@(\w+)([ \t]*\()?\n*/)

		if(!match) {
			return index
		}

		match.index += startIndex
		this.state.index = index

		if(match.index > index) {
			// If the match starts after 0, it means there’s
			// output to display
			let string = contents.substring(index, match.index)

			// Only add the output if the string isn’t
			// blank to avoid unnecessary whitespace before
			// a directive
			if(string.trim().length > 0) {
				if(this.spaceless > 0) {
					string = string.replace(/>\s+</g, '><').trim()
				}

				this.addOutputExpression(this.state.index, string)
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

		if(contents[nextIndex] === '\n') {
			nextIndex++
		}

		this.state.index = nextIndex

		return this.advance(contents, nextIndex)
	}

	/**
	 * Adds an output code expression
	 *
	 * @param number index  Index in the source file this occurs
	 * @param string output Output to display
	 */
	addOutputExpression(index, output) {
		this.expressions.push({
			type: 'code',
			contents: `output += ${this.finalizeOutput(index, output)}\n`,
			index: index
		})
	}

	/**
	 * Finalizes an output block by replacing white space
	 * and converting output tags to placeholders for
	 * use within template literals
	 *
	 * @param  {number} sourceIndex Index in the source file this occurs
	 * @param  {string} output      Raw output
	 * @return {string}             Finalized output
	 */
	finalizeOutput(sourceIndex, output) {
		const placeholders = { }
		let placeholderOrdinal = 0

		// Store raw blocks
		output = output.replace(/@\{\{([\s\S]+?)\}\}/gm, ($0, $1) => {
			const placeholder = `@@__stone_placeholder_${++placeholderOrdinal}__@@`
			placeholders[placeholder] = `{{${$1}}}`
			return placeholder
		})

		// Store regular output blocks
		output = output.replace(/\{\{\s*([\s\S]+?)\s*\}\}/gm, ($0, $1) => {
			const placeholder = `@@__stone_placeholder_${++placeholderOrdinal}__@@`
			placeholders[placeholder] = `\${escape(${$1})}`
			return placeholder
		})

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
		let min = 0
		let max = this.state.lines.length

		while(min < max) {
			const mid = min + ((max - min) >> 1)
			const { start, end } = this.state.lines[mid]

			if(position < start) {
				max = mid
			} else if(position >= end) {
				min = mid + 1
			} else {
				return {
					line: mid + 1,
					column: (position - start) + 1
				}
			}
		}

		return { line: max, column: 1 }
	}

	/**
	 * Validates the syntax of raw code and optionally
	 * throws StoneSyntaxError if it’s invalid
	 *
	 * @param  string code     Code to validate
	 * @param  number position Location of this code in the template
	 * @return string          Passed in code
	 */
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

	parseArguments(args, index = this.state.index) {
		let tree = null

		try {
			tree = AST.parse(`args(${args})`)
		} catch(err) {
			if(err instanceof SyntaxError) {
				throw new StoneSyntaxError(this, err, index)
			}

			throw err
		}

		if(
			tree.body.length > 1
			|| tree.body[0].type !== 'ExpressionStatement'
			|| tree.body[0].expression.type !== 'CallExpression'
			|| !Array.isArray(tree.body[0].expression.arguments)
			|| tree.body[0].expression.arguments.length < 1
		)  {
			throw new StoneCompilerError(this, 'Unexpected arguments.')
		}

		return tree.body[0].expression.arguments
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
