import '../Errors/StoneCompilerError'

export function compileSection(context, args) {
	if(args.indexOf(',') === -1) {
		context.sections.push(args)
		return this._compileSection(context, args, `function() {\nlet output = '';`)
	}

	args = args.split(/,/)

	if(args.length !== 2) {
		throw new StoneCompilerError(context, 'Invalid section block')
	}

	return this._compileSection(context, args[0], `function() { return escape(${args[1]}); });`)
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
	return `${this.compileEndsection(context)};\n${this.compileYield(context, section)}`
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

	return `${code}output += (_sections[${section}] || [ ]).length > 0 ? (_sections[${section}].pop())() : ''`
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
	return `output += (_.$compiler._include(_, _sections, ${view}));\n`
}
