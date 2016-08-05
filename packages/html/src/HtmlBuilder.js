import {Html5Entities} from 'html-entities'

const EOL = `\n`

let HtmlString = null

try {
	HtmlString = require('../../view').HtmlString
} catch(e) { /* Do nothing */ }

export class HtmlBuilder {
	app = null

	constructor(app) {
		this.app = app
	}

	/**
	 * Convert an HTML string to entities.
	 *
	 * @param string value
	 * @param boolean force
	 *
	 * @return string
	 */
	entities(value, force) {
		if(value instanceof HtmlString) {
			if(force !== true) {
				return value
			}

			value = value.toString()
		}

		return Html5Entities.encode(value)
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
	 * @param array  attributes
	 * @param bool   secure
	 *
	 * @return HtmlString
	 */
	script(url, attributes = { }, secure = null) {
		attributes.src = this.app.url.make(url, secure)

		return this.toHtmlString(`<script${this.attributes(attributes)}></script>${EOL}`)
	}

	/**
	 * Generate a link to a CSS file.
	 *
	 * @param string url
	 * @param array  attributes
	 * @param bool   secure
	 *
	 * @return HtmlString
	 */
	style(url, attributes =  { }, secure = null) {
		const defaults = {
			media: 'all',
			type: 'text/css',
			rel: 'stylesheet'
		}

		attributes = Object.assign({ }, defaults, attributes)
		attributes.href = this.app.url.make(url, secure)

		return this.toHtmlString(`<link${this.attributes(attributes)}>${EOL}`)
	}

	/**
	 * Generate an HTML image element.
	 *
	 * @param string url
	 * @param string alt
	 * @param array  attributes
	 * @param bool   secure
	 *
	 * @return HtmlString
	 */
	image(url, alt = null, attributes = { }, secure = null) {
		attributes.alt = alt

		return this.toHtmlString(`<img src="${this.app.url.make(url, secure)}"${this.attributes(attributes)}>`)
	}

	/**
	 * Generate a link to a Favicon file.
	 *
	 * @param string url
	 * @param array  attributes
	 * @param bool   secure
	 *
	 * @return HtmlString
	 */
	favicon(url, attributes = { }, secure = null) {
		const defaults = {
			rel: 'shortcut icon',
			type: 'image/x-icon'
		}

		attributes = Object.assign({ }, defaults, attributes)
		attributes.href = this.app.url.make(url, secure)

		return this.toHtmlString(`<link${this.attributes(attributes)}>${EOL}`)
	}

	/**
	 * Generate a HTML link.
	 *
	 * @param string url
	 * @param string title
	 * @param array  attributes
	 * @param bool   secure
	 * @param bool   escape
	 *
	 * @return HtmlString
	 */
	link(url, title = null, attributes = { }, secure = null, escape = true) {
		url = this.app.url.make(url, { }, secure)

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
	 * @param array  attributes
	 *
	 * @return HtmlString
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
	 * @param array  attributes
	 *
	 * @return HtmlString
	 */
	linkRoute(name, title = null, parameters = { }, attributes = { }) {
		return this.link(this.app.url.route(name, parameters), title, attributes)
	}

	/**
	 * Generate a HTML link to an email address.
	 *
	 * @param string email
	 * @param string title
	 * @param array  attributes
	 * @param bool   escape
	 *
	 * @return HtmlString
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
	 * @param array list
	 * @param array attributes
	 *
	 * @return HtmlString|string
	 */
	ol(list, attributes = { }) {
		return this._listing('ol', list, attributes)
	}

	/**
	 * Generate an un-ordered list of items.
	 *
	 * @param array list
	 * @param array attributes
	 *
	 * @return HtmlString|string
	 */
	ul(list, attributes = { }) {
		return this._listing('ul', list, attributes)
	}

	/**
	 * Generate a description list of items.
	 *
	 * @param array list
	 * @param array attributes
	 *
	 * @return HtmlString
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
	 * @param array  attributes
	 *
	 * @return HtmlString|string
	 */
	_listing(type, list, attributes = { }) {
		let html = ''

		if(list.isNil || list.length === 0) {
			return html
		}

		// Essentially we will just spin through the list and build the list of the HTML
		// elements from the array. We will also handled nested lists in case that is
		// present in the array. Then we will build out the final listing elements.
		for(const key of list) {
			html += this._listingElement(key, type, list[key])
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
	 * @param array attributes
	 *
	 * @return string
	 */
	attributes(attributes) {
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
	 * @param array  attributes
	 *
	 * @return HtmlString
	 */
	meta(name, content, attributes = { }) {
		const defaults = { name, content }
		attributes = Object.assign({ }, defaults, attributes)

		return this.toHtmlString(`<meta${this.attributes(attributes)}>${EOL}`)
	}

	/**
	 * Generate an html tag.
	 *
	 * @param string tag
	 * @param mixed content
	 * @param array  attributes
	 *
	 * @return HtmlString
	 */
	tag(tag, content, attributes = { }) {
		content = Array.isArray(content) ? content.join(EOL) : content
		return this.toHtmlString(`<${tag}${this.attributes(attributes)}>${EOL}${this.toHtmlString(content)}${EOL}</${tag}>${EOL}`)
	}

	/**
	 * Transform the string to an Html serializable object
	 *
	 * @param html
	 *
	 * @return HtmlString
	 */
	toHtmlString(html) {
		if(HtmlString.isNil) {
			return html
		}

		return new HtmlString(html)
	}

}
