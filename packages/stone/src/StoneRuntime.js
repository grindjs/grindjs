export class StoneRuntime {

	engine = null

	constructor(engine) {
		this.engine = engine
	}

	extends(template, context, sections) {
		return (this.compiler.compile(this.engine.resolve(template)))(context, sections)
	}

	include(context, sections, template, extra) {
		if(extra) {
			context = { ...context, ...extra }
		}

		const compiled = this.compiler.compile(this.engine.resolve(template))

		if(compiled.isLayout) {
			// Don’t pass through sections if including another layout
			return compiled(context)
		}

		return compiled(context, sections)
	}

	get compiler() {
		return this.engine.compiler
	}

}
