import '../AST'
import '../Errors/StoneCompilerError'

export function compileExtends(context, args) {
	if(context.isLayout === true) {
		throw new StoneCompilerError(context, '@extends may only be called once per view.')
	}

	args = context.parseArguments(args)

	context.isLayout = true
	context.hasLayoutContext = args.length > 1

	let code = `const __extendsLayout = ${AST.stringify(args[0])};`

	if(context.hasLayoutContext) {
		code += `\nconst __extendsContext = ${AST.stringify(args[1])};`
	}

	return code
}

export function compileSection(context, args) {
	args = context.parseArguments(args)

	if(args.length === 1) {
		args = AST.stringify(args[0])
		context.sections.push(args)
		return this._compileSection(context, args, 'function() {\nlet output = \'\';')
	}

	if(args.length !== 2) {
		throw new StoneCompilerError(context, 'Invalid section block')
	}

	return this._compileSection(
		context,
		AST.stringify(args[0]),
		`function() { return escape(${AST.stringify(args[1])}); });`
	)
}

export function _compileSection(context, name, code) {
	return `(_sections[${name}] = (_sections[${name}] || [ ])).unshift(${code}\n`
}

/**
 * Ends the current section and returns output
 * @return {string} Output from the section
 */
export function compileEndsection(context) {
	context.sections.pop()
	return 'return output;\n});'
}

/**
 * Ends the current section and yields it for display
 * @return {string} Output from the section
 */
export function compileShow(context) {
	const section = context.sections[context.sections.length - 1]
	return `${this.compileEndsection(context)}\n${this.compileYield(context, section)}`
}

/**
 * Compiles the yield directive to output a section
 *
 * @param  {object} context Context for the compilation
 * @param  {string} section Name of the section to yield
 * @return {string}         Code to render the section
 */
export function compileYield(context, section) {
	let code = ''

	if(section.indexOf(',') >= 0) {
		const sectionName = section.split(/,/)[0]
		code = `${this.compileSection(context, section)}\n`
		section = sectionName
	}

	context.validateSyntax(section)
	return `${code}output += (_sections[${section}] || [ ]).length > 0 ? (_sections[${section}].pop())() : '';`
}

/**
 * Renders content from the section section
 * @return {string} Code to render the super section
 */
export function compileSuper(context) {
	// Due to how sections work, we can cheat by just calling yeild
	// which will pop off the next chunk of content in this section
	// and render it within ours
	return this.compileYield(context, context.sections[context.sections.length - 1])
}

/**
 * Alias of compileSuper for compatibility with Blade
 * @return {string} Code to render the super section
 */
export function compileParent(context) {
	return this.compileSuper(context)
}

/**
 * Convenience directive to determine if a section has content
 * @return {string} If statement that determines if a section has content
 */
export function compileHassection(context, section) {
	context.validateSyntax(section)
	return `if((_sections[${section}] || [ ]).length > 0) {`
}

/**
 * Renders content from a subview
 *
 * @param  {object} context Context for the compilation
 * @param  {string} view    Subview to include
 * @return {string} Code to render the subview
 */
export function compileInclude(context, view) {
	context.validateSyntax(view)
	return `output += (_.$stone.include(_, _sections, __templatePathname, ${view}));\n`
}

/**
 * Compiles each directive to call the runtime and output
 * the result.
 *
 * @param  object context Context for the compilation
 * @param  string args    Arguments to pass through to runtime
 * @return string         Code to render the each block
 */
export function compileEach(context, args) {
	context.validateSyntax(`each(${args})`)
	return `output += (_.$stone.each(_, ${args}));\n`
}
