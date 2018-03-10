//  Adopted from Symfony: https://github.com/symfony/console/blob/40b3aca/Formatter/OutputFormatter.php

import './OutputFormatterStyle'

export class OutputFormatter {

	decorated = null
	styles = { }
	styleStack = [ ]

	constructor(decorated = true, styles = { }) {
		this.decorated = decorated

		this.setStyle('error', new OutputFormatterStyle('white', 'red'))
		this.setStyle('info', new OutputFormatterStyle)
		this.setStyle('comment', new OutputFormatterStyle('blue'))
		this.setStyle('warn', new OutputFormatterStyle('yellow'))
		this.setStyle('success', new OutputFormatterStyle('green'))
		this.setStyle('question', new OutputFormatterStyle('magenta'))
		this.setStyle('questionDefaultValue', new OutputFormatterStyle(null, null, [ 'dim' ]))

		this.setStyle('blue', new OutputFormatterStyle('blue'))
		this.setStyle('cyan', new OutputFormatterStyle('cyan'))
		this.setStyle('gray', new OutputFormatterStyle('gray'))
		this.setStyle('green', new OutputFormatterStyle('green'))
		this.setStyle('magenta', new OutputFormatterStyle('magenta'))
		this.setStyle('red', new OutputFormatterStyle('red'))
		this.setStyle('white', new OutputFormatterStyle('white'))
		this.setStyle('yellow', new OutputFormatterStyle('yellow'))

		this.setStyle('groupTitle', new OutputFormatterStyle('magenta'))
		this.setStyle('groupItem', new OutputFormatterStyle('blue'))
		this.setStyle('groupItemHelp', new OutputFormatterStyle())
		this.setStyle('groupItemValue', new OutputFormatterStyle('yellow'))

		for(const [ name, style ] in Object.entries(styles)) {
			this.setStyle(name, style)
		}
	}

	static escapeText(text) {
		return text.replace(/([^\\\\]?)</, '$1\\<')
	}

	setStyle(name, style) {
		this.styles[name] = style
	}

	hasStyle(name) {
		return !!this.styles[name]
	}

	getStyle(name) {
		return this.styles[name]
	}

	format(message) {
		message = message.toString()

		let offset = 0
		let output = ''
		const tagRegex = '[a-z][a-z0-9_=-]*'

		message.replace(new RegExp(`<((${tagRegex})|/(${tagRegex})?)>`, 'ig'), ($0, $1, $2, $3, index) => {
			if(index !== 0 && message[index - 1] === '\\') {
				return
			}

			// add the text up to the next tag
			output += this._applyCurrentStyle(message.substring(offset, index))
			offset = index + $0.length

			// opening tag?
			const open = $1.substring(0, 1) !== '/'
			let tag = null

			if(open) {
				tag = $2
			} else {
				tag = $3 || ''
			}

			if(!open && tag.length === 0) {
				// </>
				this.styleStack.pop()
				return
			}

			const style = this._createStyleFromString(tag)

			if(!style) {
				output += this._applyCurrentStyle($1)
			} else if(open) {
				this.styleStack.push(style)
			} else {
				this.styleStack.pop(style)
			}
		})

		output += this._applyCurrentStyle(message.substring(offset))
		return output.replace(/\\</g, '<')
	}

	_createStyleFromString(string) {
		return this.styles[string]
	}

	_applyCurrentStyle(text) {
		if(this.styleStack.length === 0) {
			return text
		}

		return this._applyStyle(text, this.styleStack[this.styleStack.length - 1])
	}

	_applyStyle(text, style) {
		if(this.decorated && text.length > 0) {
			return style.apply(text)
		}

		return text
	}

}
