const path = require('path')

export class AssetContainer {

	req = null
	res = null
	factory = null
	view = null

	_styles = [ ]
	_scripts = [ ]

	constructor(req, res, factory, view) {
		this.req = req
		this.res = res
		this.factory = factory
		this.view = view
	}

	append(type, asset) {
		if(type.isNil) {
			return this.infer(asset)
		}

		if(typeof this[type] !== 'function') {
			Log.error('Invalid asset type', type)
			return
		}

		this[type](asset)
	}

	infer(asset) {
		switch(path.extname(asset).toLowerCase()) {
			case '.css':
			case '.scss':
			case '.less':
			case '.sass':
			case '.styl':
			case '.stylus':
				return this.style(asset)
			case '.js':
			case '.jsx':
			case '.json':
			case '.es':
			case '.es6':
			case '.es7':
			case '.babel':
			case '.coffee':
				return this.script(asset)
		}

		Log.error('Unable to infer asset type', asset)
	}

	css(asset) {
		return this._expand(asset, 'css', 'css', 'style')
	}

	less(asset) {
		return this._expand(asset, 'less', 'less', 'style')
	}

	sass(asset) {
		return this._expand(asset, 'sass', 'sass', 'style')
	}

	scss(asset) {
		return this._expand(asset, 'scss', 'scss', 'style')
	}

	styl(asset) {
		return this._expand(asset, 'stylus', 'styl', 'style')
	}

	stylus(asset) {
		return this._expand(asset, 'stylus', 'stylus', 'style')
	}

	babel(asset) {
		return this._expand(asset, 'babel', 'js', 'script')
	}

	js(asset) {
		return this._expand(asset, 'js', 'js', 'script')
	}

	coffee(asset) {
		return this._expand(asset, 'coffee', 'coffee', 'script')
	}

	_expand(asset, dir, extension, type) {
		asset = path.join(dir, asset)

		if(asset.indexOf('.') === -1) {
			asset += `.${extension}`
		}

		return this[type](asset)
	}

	style(asset) {
		this._styles.push(this.makeUrl(asset))
	}

	script(asset) {
		this._scripts.push(this.makeUrl(asset))
	}

	render(type) {
		switch(type.toLowerCase()) {
			case 'style':
			case 'styles':
			case 'css':
				return this.view.toHtmlString(this._styles.reverse().map(style => this.makeStyle(style)).join(''))
			case 'script':
			case 'scripts':
			case 'js':
				return this.view.toHtmlString(this._scripts.reverse().map(script => this.makeScript(script)).join(''))
		}

		Log.error('Unsupported render type', type)
	}

	makeUrl(asset) {
		if(asset.indexOf('://') > 0) {
			return asset
		}

		return this.factory.publishedPath(asset, this.req)
	}

	makeStyle(style) {
		return `<link media="all" type="text/css" rel="stylesheet" href="${style}" />\n`
	}

	makeScript(script) {
		return `<script src="${script}"></script>\n`
	}

}
