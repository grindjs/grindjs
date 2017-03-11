import { Html5Entities } from 'html-entities'

const EOL = '\n'

export class HtmlBuilder {

	/**
	 * The app instance.
	 */
	app = null

	/**
	 * The req instance, if in a request lifecycle
	 */
	req = null

	/**
	 * The res instance, if in a request lifecycle
	 */
	res = null

	/**
	 * Create a new html builder instance.
	 *
	 * @param object app
	 */
	constructor(app) {
		this.app = app
	}

	/**
	 * Clone the instance to be used within a
	 * request cycle.
	 *
	 * @param object req
	 * @param object res
	 *
	 * @return object
	 */
	clone(req, res) {
		const cloned = new this.constructor(this.app)
		cloned.req = req
		cloned.res = res
		return cloned
	}

	/**
	 * Convert an HTML string to entities.
	 *
	 * @param string  value
	 * @param boolean force
	 *
	 * @return string
	 */
	entities(value, force) {
		if(this._isHtmlString(value) && force !== true) {
			return value
		}

		return Html5Entities.encode(value.toString())
	}

	/**
	 * Convert entities to HTML characters.
	 *
	 * @param string value
	 *
	 * @return string
	 */
	decode(value) {
		return Html5Entities.decode(value)
	}

	/**
	 * Generate a link to a JavaScript file.
	 *
	 * @param string url
	 * @param object attributes
	 * @param bool   secure
	 *
	 * @return SafeString
	 */
	script(url, attributes = { }, secure = null) {
		attributes.src = this.app.url.make(url, null, this.req, secure)

		return this.toHtmlString(`<script${this.attributes(attributes)}></script>${EOL}`)
	}

	/**
	 * Generate a link to a CSS file.
	 *
	 * @param string url
	 * @param object attributes
	 * @param bool   secure
	 *
	 * @return SafeString
	 */
	style(url, attributes =  { }, secure = null) {
		const defaults = {
			media: 'all',
			type: 'text/css',
			rel: 'stylesheet'
		}

		attributes = Object.assign({ }, defaults, attributes)
		attributes.href = this.app.url.make(url, null, this.req, secure)

		return this.toHtmlString(`<link${this.attributes(attributes)} />${EOL}`)
	}

	/**
	 * Generate an HTML image element.
	 *
	 * @param string url
	 * @param string alt
	 * @param object attributes
	 * @param bool   secure
	 *
	 * @return SafeString
	 */
	image(url, alt = null, attributes = { }, secure = null) {
		url = this.app.url.make(url, null, this.req, secure)
		attributes.alt = alt

		return this.toHtmlString(`<img src="${url}"${this.attributes(attributes)} />`)
	}

	/**
	 * Generate a link to a Favicon file.
	 *
	 * @param string url
	 * @param object attributes
	 * @param bool   secure
	 *
	 * @return SafeString
	 */
	favicon(url, attributes = { }, secure = null) {
		const defaults = {
			rel: 'shortcut icon',
			type: 'image/x-icon'
		}

		attributes = Object.assign({ }, defaults, attributes)
		attributes.href = this.app.url.make(url, null, this.req, secure)

		return this.toHtmlString(`<link${this.attributes(attributes)} />${EOL}`)
	}

	/**
	 * Generate a HTML link.
	 *
	 * @param string url
	 * @param string title
	 * @param object attributes
	 * @param bool   secure
	 * @param bool   escape
	 *
	 * @return SafeString
	 */
	link(url, title = null, attributes = { }, secure = null, escape = true) {
		if(url.substring(0, 1) !== '#') {
			url = this.app.url.make(url, null, this.req, secure)
		}

		if(title.isNil || title === false) {
			title = url
		}

		if(escape) {
			title = this.entities(title)
		}

		return this.toHtmlString(`<a href="${url}"${this.attributes(attributes)}>${title}</a>`)
	}

	/**
	 * Generate a HTTPS HTML link.
	 *
	 * @param string url
	 * @param string title
	 * @param object attributes
	 *
	 * @return SafeString
	 */
	secureLink(url, title = null, attributes = { }) {
		return this.link(url, title, attributes, true)
	}


	/**
	 * Generate a HTML link to a named route.
	 *
	 * @param string name
	 * @param string title
	 * @param array  parameters
	 * @param object attributes
	 * @param bool   secure
	 *
	 * @return SafeString
	 */
	linkRoute(name, title = null, parameters = { }, attributes = { }, secure = null) {
		return this.link(this.app.url.route(name, parameters, this.req, secure), title, attributes)
	}

	/**
	 * Generate a HTML link to an email address.
	 *
	 * @param string email
	 * @param string title
	 * @param object attributes
	 * @param bool   escape
	 *
	 * @return SafeString
	 */
	mailto(email, title = null, attributes = { }, escape = true) {
		email = this.email(email)

		title = title || email

		if(escape) {
			title = this.entities(title)
		}

		email = `mailto:${email}`

		return this.toHtmlString(`<a href="${email}"${this.attributes(attributes)}>${title}</a>`)
	}

	/**
	 * Obfuscate an e-mail address to prevent spam-bots from sniffing it.
	 *
	 * @param string email
	 *
	 * @return string
	 */
	email(email) {
		return email.replace('@', '&#64;')
	}

	/**
	 * Generates non-breaking space entities based on number supplied.
	 *
	 * @param int num
	 *
	 * @return string
	 */
	nbsp(num = 1) {
		return '&nbsp;'.repeat(num)
	}

	/**
	 * Generate an ordered list of items.
	 *
	 * @param array  list
	 * @param object attributes
	 *
	 * @return SafeString|string
	 */
	ol(list, attributes = { }) {
		return this._listing('ol', list, attributes)
	}

	/**
	 * Generate an un-ordered list of items.
	 *
	 * @param array  list
	 * @param object attributes
	 *
	 * @return SafeString|string
	 */
	ul(list, attributes = { }) {
		return this._listing('ul', list, attributes)
	}

	/**
	 * Generate a description list of items.
	 *
	 * @param array  list
	 * @param object attributes
	 *
	 * @return SafeString
	 */
	dl(list, attributes = { }) {
		attributes = this.attributes(attributes)

		let html = `<dl${attributes}>`

		for(const key of Object.keys(list)) {
			let values = list[key]

			if(!Array.isArray(values)) {
				values = [ values ]
			}

			html += `<dt>${key}</dt>`

			for(const value of values) {
				html += `<dd>${value}</dd>`
			}
		}

		html += '</dl>'

		return this.toHtmlString(html)
	}

	/**
	 * Create a listing HTML element.
	 *
	 * @param string type
	 * @param array  list
	 * @param object attributes
	 *
	 * @return SafeString|string
	 */
	_listing(type, list, attributes = { }) {
		let html = ''

		if(list.isNil || list.length === 0) {
			return html
		}

		// Essentially we will just spin through the list and build the list of the HTML
		// elements from the array. We will also handled nested lists in case that is
		// present in the array. Then we will build out the final listing elements.
		if(Array.isArray(list)) {
			const length = list.length

			for(let i = 0; i < length; i++) {
				html += this._listingElement(i, type, list[i])
			}
		} else {
			for(const [ key, value ] of Object.entries(list)) {
				html += this._listingElement(key, type, value)
			}
		}

		attributes = this.attributes(attributes)

		return this.toHtmlString(`<${type}${attributes}>${html}</${type}>`)
	}

	/**
	 * Create the HTML for a listing element.
	 *
	 * @param mixed  key
	 * @param string type
	 * @param mixed  value
	 *
	 * @return string
	 */
	_listingElement(key, type, value) {
		if(Array.isArray(value)) {
			return this._nestedListing(key, type, value)
		} else {
			return `<li>${this.entities(value)}</li>`
		}
	}

	/**
	 * Create the HTML for a nested listing attribute.
	 *
	 * @param mixed  key
	 * @param string type
	 * @param mixed  value
	 *
	 * @return string
	 */
	_nestedListing(key, type, value) {
		if(typeof key === 'number') {
			return this._listing(type, value)
		} else {
			return `<li>${key}${this._listing(type, value)}</li>`
		}
	}

	/**
	 * Build an HTML attribute string from an array.
	 *
	 * @param object attributes
	 *
	 * @return string
	 */
	attributes(attributes) {
		if(attributes.isNil) {
			return ''
		}

		const html = [ ]

		if(typeof attributes === 'string') {
			attributes = { [attributes]: null }
		}

		for(const key of Object.keys(attributes)) {
			const element = this.attributeElement(key, attributes[key])

			if(!element.isNil) {
				html.push(element)
			}
		}

		return html.length > 0 ? ` ${html.join(' ')}` : ''
	}

	/**
	 * Build a single attribute element.
	 *
	 * @param string key
	 * @param string value
	 *
	 * @return string
	 */
	attributeElement(key, value) {
		// For numeric keys we will assume that the key and the value are the same
		// as this will convert HTML attributes such as "required" to a correct
		// form like required="required" instead of using incorrect numerics.
		if(typeof key === 'number') {
			key = value
		}

		if(value.isNil) {
			return null
		}

		return `${key}="${this.entities(value)}"`
	}

	/**
	 * Generate a meta tag.
	 *
	 * @param string name
	 * @param string content
	 * @param object attributes
	 *
	 * @return SafeString
	 */
	meta(name, content, attributes = { }) {
		const defaults = { name, content }
		attributes = Object.assign({ }, defaults, attributes)

		return this.toHtmlString(`<meta${this.attributes(attributes)} />${EOL}`)
	}

	/**
	 * Generate an html tag.
	 *
	 * @param string tag
	 * @param mixed  content
	 * @param object attributes
	 *
	 * @return SafeString
	 */
	tag(tag, content, attributes = { }) {
		content = Array.isArray(content) ? content.join(EOL) : content
		const html = this.toHtmlString(content)
		return this.toHtmlString(`<${tag}${this.attributes(attributes)}>${EOL}${html}${EOL}</${tag}>${EOL}`)
	}

	/**
	 * Transform the string to an Html serializable object
	 *
	 * @param html
	 *
	 * @return SafeString
	 */
	toHtmlString(html) {
		return this.app.view.toHtmlString(html)
	}

	_isHtmlString(html) {
		return this.app.view.isHtmlString(html)
	}

}
