//  Adopted from Symfony: https://github.com/symfony/console/blob/40b3aca/Formatter/OutputFormatterStyle.php

import { constructor as Chalk } from 'chalk'
const chalk = new Chalk({ enabled: true })

export class OutputFormatterStyle {
	foreground = null
	background = null
	options = [ ]

	constructor(foreground = null, background = null, options = [ ]) {
		this.foreground = foreground
		this.background = background
		this.options = [ ...options ]
	}

	setOption(value) {
		this.options.push(value)
	}

	apply(text) {
		let style = chalk
		let count = 0

		if(!this.foreground.isNil) {
			style = style[this.foreground]
			count++
		}

		if(!this.background.isNil) {
			style = style[`bg${this.background.substring(0, 1).toUpperCase()}${this.background.substring(1)}`]
			count++
		}

		for(const option of this.options) {
			style = style[option]
			count++
		}

		if(count === 0) {
			return text
		}

		return style(text)
	}

}
