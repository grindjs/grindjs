export class AssetExtension {
	tags = [
		'asset',
		'style', 'css', 'sass', 'scss', 'styl', 'stylus', 'less',
		'script', 'js', 'babel', 'coffee'
	]

	parse(parser, nodes) {
		const tag = parser.peekToken().value
		const token = parser.nextToken()
		const args = parser.parseSignature(null, true)
		parser.advanceAfterBlockEnd(token.value)
		return new nodes.CallExtension(this, tag, args)
	}

	asset(context, type, value) {
		if(context.ctx._assetContainer.isNil) {
			Log.error('Missing asset container, ignoring asset tag.')
			return
		}

		if(value.isNil) {
			value = type
			type = null
		}

		if(type !== 'render') {
			context.ctx._assetContainer.append(type, value)
		} else {
			return context.ctx._assetContainer.render(value)
		}
	}

	style(context, value) {
		return this.asset(context, 'style', value)
	}

	css(context, value) {
		return this.asset(context, 'css', value)
	}

	sass(context, value) {
		return this.asset(context, 'sass', value)
	}

	scss(context, value) {
		return this.asset(context, 'scss', value)
	}

	styl(context, value) {
		return this.asset(context, 'styl', value)
	}

	stylus(context, value) {
		return this.asset(context, 'stylus', value)
	}

	less(context, value) {
		return this.asset(context, 'less', value)
	}

	script(context, value) {
		return this.asset(context, 'script', value)
	}

	js(context, value) {
		return this.asset(context, 'js', value)
	}

	babel(context, value) {
		return this.asset(context, 'babel', value)
	}

	coffee(context, value) {
		return this.asset(context, 'coffee', value)
	}

}
