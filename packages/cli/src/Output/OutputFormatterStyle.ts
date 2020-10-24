//  Adopted from Symfony: https://github.com/symfony/console/blob/40b3aca/Formatter/OutputFormatterStyle.php

import { Instance as Chalk } from 'chalk'
const chalk = new Chalk()

export type Modifier =
	| 'bold'
	| 'dim'
	| 'hidden'
	| 'inverse'
	| 'italic'
	| 'strikethrough'
	| 'underline'
	| 'visible'

export type Color =
	| 'black'
	| 'blackBright'
	| 'blue'
	| 'blueBright'
	| 'cyan'
	| 'cyanBright'
	| 'gray'
	| 'green'
	| 'greenBright'
	| 'grey'
	| 'magenta'
	| 'magentaBright'
	| 'red'
	| 'redBright'
	| 'white'
	| 'whiteBright'
	| 'yellow'
	| 'yellowBright'

export class OutputFormatterStyle {
	options: Modifier[] = []

	constructor(
		public foreground: Color | null = null,
		public background: Color | null = null,
		options: Modifier[] = [],
	) {
		this.foreground = foreground
		this.background = background
		this.options = [...options]
	}

	setOption(value: Modifier) {
		this.options.push(value)
	}

	apply(text: string) {
		let style = chalk
		let count = 0

		if (this.foreground !== null && this.foreground !== undefined) {
			style = style[this.foreground]
			count++
		}

		if (this.background !== null && this.background !== undefined) {
			style = style.bgKeyword(this.background)
			count++
		}

		for (const option of this.options) {
			style = style[option]
			count++
		}

		if (count === 0) {
			return text
		}

		return style(text)
	}
}
