import './Template'
import './Compiler'
import './HtmlString'

export class StoneEngine {
	viewsPath = null
	compiler = null

	context = {
		escape: Template.escape,
		HtmlString: HtmlString
	}

	constructor(viewsPath) {
		this.viewsPath = viewsPath
		this.compiler = new Compiler(this)
	}

	render(template, context) {
		const compiled = this.compiler.compile(this.resolve(template))
		const rendered = compiled({
			...this.context,
			...context,
			$engine: this,
			$compiler: this.compiler
		})

		return rendered
	}

	renderString(template, context) {
		const compiled = this.compiler.compileString(template)
		const rendered = compiled({
			...this.context,
			...context,
			$engine: this,
			$compiler: this.compiler
		})

		return rendered
	}

	resolve(template) {
		return `${this.viewsPath}/${template.replace(/\./g, '/')}.stone`
	}

}
