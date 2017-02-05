import dateFormat from 'dateformat'
import cast from 'as-type'
import { Obj } from 'grind-support'

export class FormBuilder {

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
	 * The HtmlBuilder instance.
	 */
	html = null

	/**
	 * The CSRF token used by the form builder.
	 *
	 * @var string
	 */
	csrfToken = null

	/**
	 * The current model instance for the form.
	 *
	 * @var mixed
	 */
	_model = null

	/**
	 * An array of label names we've created.
	 *
	 * @var array
	 */
	labels = [ ]

	/**
	 * The reserved form open attributes.
	 *
	 * @var array
	 */
	reserved = [ 'method', 'url', 'route', 'action', 'files' ]

	/**
	 * The form methods that should be spoofed, in uppercase.
	 *
	 * @var array
	 */
	spoofedMethods = [ 'DELETE', 'PATCH', 'PUT' ]

	/**
	 * The types of inputs to not fill values on by default.
	 *
	 * @var array
	 */
	skipValueTypes = [ 'file', 'password', 'checkbox', 'radio' ]

	/**
	 * Create a new form builder instance.
	 *
	 * @param  object app
	 * @param  object html
	 * @param  string csrfToken
	 */
	constructor(app, html, csrfToken) {
		this.app = app
		this.html = html
		this.csrfToken = csrfToken
	}

	/**
	 * Clone the instance to be used within a
	 * request cycle.
	 *
	 * @param object req
	 * @param object res
	 * @param object cloned html instance or null
	 *
	 * @return object
	 */
	clone(req, res, html) {
		const cloned = new this.constructor(this.app, html || this.html, this.csrfToken)
		cloned.req = req
		cloned.res = res
		return cloned
	}

	/**
	 * Open up a new HTML form.
	 *
	 * @param  object options
	 *
	 * @return SafeString
	 */
	open(options = { }) {
		const method = options.method || 'post'

		// We need to extract the proper method from the attributes. If the method is
		// something other than GET or POST we'll use POST since we will spoof the
		// actual method since forms don't support the reserved methods in HTML.
		const attributes = {
			method: this._getMethod(method),
			action: this._getAction(options),
			['accept-charset']: 'UTF-8'
		}

		// If the method is PUT, PATCH or DELETE we will need to add a spoofer hidden
		// field that will instruct the Symfony request to pretend the method is a
		// different method than it actually is, for convenience from the forms.
		const append = this._getAppendage(method)

		if(!options.files.isNil) {
			options.enctype = 'multipart/form-data'
		}

		// Finally we're ready to create the final form HTML field. We will attribute
		// format the array of attributes. We will also add on the appendage which
		// is used to spoof requests for this PUT, PATCH, etc. methods on forms.
		for(const key of Object.keys(options)) {
			if(this.reserved.indexOf(key) >= 0) {
				continue
			}

			attributes[key] = options[key]
		}

		// Finally, we will concatenate all of the attributes into a single string so
		// we can build out the final form open statement. We'll also append on an
		// extra value for the hidden _method field if it's needed for the form.
		const attributesHtml = this.html.attributes(attributes)

		return this.toHtmlString(`<form${attributesHtml}>${append}`)
	}

	/**
	 * Create a new model based form builder.
	 *
	 * @param  mixed  model
	 * @param  object options
	 *
	 * @return SafeString
	 */
	model(model, options = { }) {
		this._model = model

		return this.open(options)
	}

	/**
	 * Set the model instance on the form builder.
	 *
	 * @param  mixed model
	 *
	 * @return void
	 */
	setModel(model) {
		this._model = model
	}

	/**
	 * Close the current form.
	 *
	 * @return string
	 */
	close() {
		this.labels = [ ]
		this._model = null

		return this.toHtmlString('</form>')
	}

	/**
	 * Generate a hidden field with the current CSRF token.
	 *
	 * @return string
	 */
	token() {
		let token = this.csrfToken

		if(token.isNil || token.length) {
			token = 'UNSUPPORTED'
		}

		return this.hidden('_token', token)
	}

	/**
	 * Create a form label element.
	 *
	 * @param  string name
	 * @param  string value
	 * @param  object options
	 * @param  bool   escape_html
	 *
	 * @return SafeString
	 */
	label(name, value = null, options = { }, escapeHtml = true) {
		this.labels.push(name)

		options = this.html.attributes(options)

		value = this._formatLabel(name, value)

		if(escapeHtml) {
			value = this.html.entities(value)
		}

		return this.toHtmlString(`<label for="${name}"${options}>${value}</label>`)
	}

	/**
	 * Format the label value.
	 *
	 * @param  string      name
	 * @param  string|null value
	 *
	 * @return string
	 */
	_formatLabel(name, value) {
		if(!value.isNil) {
			return value
		}

		return name.replace(/_/, ' ').replace(/(\b[a-z\x00-\x7F])/gi, s => s.toLocaleUpperCase())
	}

	/**
	 * Create a form input field.
	 *
	 * @param  string type
	 * @param  string name
	 * @param  string value
	 * @param  object options
	 *
	 * @return SafeString
	 */
	input(type, name, value = null, options = { }) {
		if(options.name.isNil) {
			options.name = name
		}

		// We will get the appropriate value for the given field. We will look for the
		// value in the session for the value in the old input data then we'll look
		// in the model instance if one is set. Otherwise we will just use empty.
		const id = this.getIdAttribute(name, options)

		if(this.skipValueTypes.indexOf(type) === -1) {
			value = this.getValueAttribute(name, value)
		}

		// Once we have the type, value, and ID we can merge them into the rest of the
		// attributes array so we can convert them into their HTML attribute format
		// when creating the HTML element. Then, we will return the entire input.
		options = { ...options, type, value, id }

		return this.toHtmlString(`<input${this.html.attributes(options)} />`)
	}

	/**
	 * Create a text input field.
	 *
	 * @param  string name
	 * @param  string value
	 * @param  object options
	 *
	 * @return SafeString
	 */
	text(name, value = null, options = { }) {
		return this.input('text', name, value, options)
	}

	/**
	 * Create a password input field.
	 *
	 * @param  string name
	 * @param  object options
	 *
	 * @return SafeString
	 */
	password(name, options = { }) {
		return this.input('password', name, '', options)
	}

	/**
	 * Create a hidden input field.
	 *
	 * @param  string name
	 * @param  string value
	 * @param  object options
	 *
	 * @return SafeString
	 */
	hidden(name, value = null, options = { }) {
		return this.input('hidden', name, value, options)
	}

	/**
	 * Create an e-mail input field.
	 *
	 * @param  string name
	 * @param  string value
	 * @param  object options
	 *
	 * @return SafeString
	 */
	email(name, value = null, options = { }) {
		return this.input('email', name, value, options)
	}

	/**
	 * Create a tel input field.
	 *
	 * @param  string name
	 * @param  string value
	 * @param  object options
	 *
	 * @return SafeString
	 */
	tel(name, value = null, options = { }) {
		return this.input('tel', name, value, options)
	}

	/**
	 * Create a number input field.
	 *
	 * @param  string name
	 * @param  string value
	 * @param  object options
	 *
	 * @return SafeString
	 */
	number(name, value = null, options = { }) {
		return this.input('number', name, value, options)
	}

	/**
	 * Create a date input field.
	 *
	 * @param  string name
	 * @param  string value
	 * @param  object options
	 *
	 * @return SafeString
	 */
	date(name, value = null, options = { }) {
		if(value instanceof Date) {
			value = dateFormat(value, 'yyyy-mm-dd')
		}

		return this.input('date', name, value, options)
	}

	/**
	 * Create a datetime input field.
	 *
	 * @param  string name
	 * @param  string value
	 * @param  object options
	 *
	 * @return SafeString
	 */
	datetime(name, value = null, options = { }) {
		if(value instanceof Date) {
			value = value.toISOString()
		}

		return this.input('datetime', name, value, options)
	}

	/**
	 * Create a time input field.
	 *
	 * @param  string name
	 * @param  string value
	 * @param  object options
	 *
	 * @return SafeString
	 */
	time(name, value = null, options = { }) {
		return this.input('time', name, value, options)
	}

	/**
	 * Create a url input field.
	 *
	 * @param  string name
	 * @param  string value
	 * @param  object options
	 *
	 * @return SafeString
	 */
	url(name, value = null, options = { }) {
		return this.input('url', name, value, options)
	}

	/**
	 * Create a file input field.
	 *
	 * @param  string name
	 * @param  object options
	 *
	 * @return SafeString
	 */
	file(name, options = { }) {
		return this.input('file', name, null, options)
	}

	/**
	 * Create a textarea input field.
	 *
	 * @param  string name
	 * @param  string value
	 * @param  object options
	 *
	 * @return SafeString
	 */
	textarea(name, value = null, options = { }) {
		if(options.name.isNil) {
			options.name = name
		}

		// Next we will look for the rows and cols attributes, as each of these are put
		// on the textarea element definition. If they are not present, we will just
		// assume some sane default values for these attributes for the developer.
		options = this._setTextAreaSize(options)
		options.id = this.getIdAttribute(name, options)
		delete options.size

		value = (this.getValueAttribute(name, value) || '').toString()

		// Next we will convert the attributes into a string form. Also we have removed
		// the size attribute, as it was merely a short-cut for the rows and cols on
		// the element. Then we'll create the final textarea elements HTML for us.
		options = this.html.attributes(options)

		return this.toHtmlString(`<textarea${options}>${this.html.entities(value)}</textarea>`)
	}

	/**
	 * Set the text area size on the attributes.
	 *
	 * @param  object options
	 *
	 * @return array
	 */
	_setTextAreaSize(options) {
		if(!options.size.isNil) {
			return this._setQuickTextAreaSize(options)
		}

		// If the "size" attribute was not specified, we will just look for the regular
		// columns and rows attributes, using sane defaults if these do not exist on
		// the attributes array. We'll then return this entire options array back.
		const cols = options.cols || 50
		const rows = options.rows || 10

		return Object.assign({ }, options, { cols, rows })
	}

	/**
	 * Set the text area size using the quick "size" attribute.
	 *
	 * @param  object options
	 *
	 * @return array
	 */
	_setQuickTextAreaSize(options) {
		const segments = options.size.split(/x/)

		return Object.assign({ }, options, {
			cols: segments[0],
			rows: segments[1]
		})
	}

	/**
	 * Create a select box field.
	 *
	 * @param  string name
	 * @param  array  list
	 * @param  string selected
	 * @param  object options
	 *
	 * @return SafeString
	 */
	select(name, list = [ ], selected = null, options = { }) {
		// When building a select box the "value" attribute is really the selected one
		// so we will use that when checking the model or session for a value which
		// should provide a convenient method of re-populating the forms on post.
		selected = this.getValueAttribute(name, selected)

		options.id = this.getIdAttribute(name, options)

		if(options.name.isNil) {
			options.name = name
		}

		// We will simply loop through the options and build an HTML value for each of
		// them until we have an array of HTML declarations. Then we will join them
		// all together into one single HTML element that can be put on the form.
		const html = [ ]

		if(!options.placeholder.isNil) {
			html.push(this._placeholderOption(options.placeholder, selected))
			delete options.placeholder
		}

		for(const [ key, value ] of Object.entries(list)) {
			html.push(this.getSelectOption(value, key, selected))
		}

		// Once we have all of this HTML, we can join this into a single element after
		// formatting the attributes into an HTML "attributes" string, then we will
		// build out a final select statement, which will contain all the values.
		options = this.html.attributes(options)

		list = html.join('')

		return this.toHtmlString(`<select${options}>${list}</select>`)
	}

	/**
	 * Create a select range field.
	 *
	 * @param  string name
	 * @param  string begin
	 * @param  string end
	 * @param  string selected
	 * @param  object options
	 *
	 * @return SafeString
	 */
	selectRange(name, begin, end, selected = null, options = { }) {
		const range = { }

		for(let i = begin; i <= end; i++) {
			range[i] = i
		}

		return this.select(name, range, selected, options)
	}

	/**
	 * Create a select year field.
	 *
	 * @param  string name
	 * @param  string begin
	 * @param  string end
	 * @param  string selected
	 * @param  object options
	 *
	 * @return mixed
	 */
	selectYear(...args) {
		return this.selectRange(...args)
	}

	/**
	 * Create a select month field.
	 *
	 * @param  string name
	 * @param  string selected
	 * @param  object options
	 * @param  string format
	 *
	 * @return SafeString
	 */
	selectMonth(name, selected = null, options = { }, format = 'mmmm') {
		const months = { }

		for(let month = 1; month <= 12; month++) {
			months[month] = dateFormat(new Date(0, month - 1), format)
		}

		return this.select(name, months, selected, options)
	}

	/**
	 * Get the select option for the given value.
	 *
	 * @param  string display
	 * @param  string value
	 * @param  string selected
	 *
	 * @return SafeString
	 */
	getSelectOption(display, value, selected) {
		if(Array.isArray(display) || typeof display === 'object') {
			return this._optionGroup(display, value, selected)
		}

		return this._option(display, value, selected)
	}

	/**
	 * Create an option group form element.
	 *
	 * @param  object list
	 * @param  string label
	 * @param  string selected
	 *
	 * @return SafeString
	 */
	_optionGroup(list, label, selected) {
		const html = [ ]

		for(const [ key, value ] of Object.entries(list)) {
			html.push(this._option(value, key, selected))
		}

		return this.toHtmlString(`<optgroup label="${this.html.entities(label)}">${html.join('')}</optgroup>`)
	}

	/**
	 * Create a select element option.
	 *
	 * @param  string display
	 * @param  string value
	 * @param  string selected
	 *
	 * @return SafeString
	 */
	_option(display, value, selected) {
		selected = this._getSelectedValue(value, selected)

		const options = { value, selected }

		return this.toHtmlString(`<option${this.html.attributes(options)}>${this.html.entities(display)}</option>`)
	}

	/**
	 * Create a placeholder select element option.
	 *
	 * @param display
	 * @param selected
	 *
	 * @return SafeString
	 */
	_placeholderOption(display, selected) {
		selected = this._getSelectedValue(null, selected)

		const options = { selected, value: '' }

		return this.toHtmlString(`<option${this.html.attributes(options)}>${this.html.entities(display)}</option>`)
	}

	/**
	 * Determine if the value is selected.
	 *
	 * @param  string value
	 * @param  string selected
	 *
	 * @return null|string
	 */
	_getSelectedValue(value, selected) {
		if(Array.isArray(selected)) {
			return selected.indexOf(value) >= 0 ? 'selected' : null
		}

		const hasValue = !value.isNil
		const hasSelected = !selected.isNil

		if(!hasValue && !hasSelected) {
			return 'selected'
		} else if(!hasValue) {
			return null
		} else if(!hasSelected) {
			return null
		}

		return value.toString() === selected.toString() ? 'selected' : null
	}

	/**
	 * Create a checkbox input field.
	 *
	 * @param  string name
	 * @param  mixed  value
	 * @param  bool   checked
	 * @param  object options
	 *
	 * @return SafeString
	 */
	checkbox(name, value = 1, checked = null, options = { }) {
		return this._checkable('checkbox', name, value, checked, options)
	}

	/**
	 * Create a radio button input field.
	 *
	 * @param  string name
	 * @param  mixed  value
	 * @param  bool   checked
	 * @param  object options
	 *
	 * @return SafeString
	 */
	radio(name, value = null, checked = null, options = { }) {
		if(value.isNil) {
			value = name
		}

		return this._checkable('radio', name, value, checked, options)
	}

	/**
	 * Create a checkable input field.
	 *
	 * @param  string type
	 * @param  string name
	 * @param  mixed  value
	 * @param  bool   checked
	 * @param  object options
	 *
	 * @return SafeString
	 */
	_checkable(type, name, value, checked, options) {
		checked = this._getCheckedState(type, name, value, checked)

		if(checked) {
			options.checked = 'checked'
		}

		return this.input(type, name, value, options)
	}

	/**
	 * Get the check state for a checkable input.
	 *
	 * @param  string type
	 * @param  string name
	 * @param  mixed  value
	 * @param  bool   checked
	 *
	 * @return bool
	 */
	_getCheckedState(type, name, value, checked) {
		switch(type) {
			case 'checkbox':
				return this._getCheckboxCheckedState(name, value, checked)

			case 'radio':
				return this._getRadioCheckedState(name, value, checked)

			default:
				return this.getValueAttribute(name) === value
		}
	}

	/**
	 * Get the check state for a checkbox input.
	 *
	 * @param  string name
	 * @param  mixed  value
	 * @param  bool   checked
	 *
	 * @return bool
	 */
	_getCheckboxCheckedState(name, value, checked) {
		if(!this.oldInputIsEmpty()) {
			const oldValue = this.old(name)

			if(oldValue.isNil) {
				return false
			}
		}

		if(this._missingOldAndModel(name)) {
			return checked
		}

		const posted = this.getValueAttribute(name, checked)

		if(Array.isArray(posted)) {
			return posted.map(v => v.toString()).indexOf(value.toString()) >= 0
		}

		return cast.boolean(posted)
	}

	/**
	 * Get the check state for a radio input.
	 *
	 * @param  string name
	 * @param  mixed  value
	 * @param  bool   checked
	 *
	 * @return bool
	 */
	_getRadioCheckedState(name, value, checked) {
		if(this._missingOldAndModel(name)) {
			return checked
		}

		return this.getValueAttribute(name) === value
	}

	/**
	 * Determine if old input or model input exists for a key.
	 *
	 * @param  string name
	 *
	 * @return bool
	 */
	_missingOldAndModel(name) {
		const oldValue = this.old(name)

		if(!oldValue.isNil) {
			return false
		}

		if(this._model.isNil) {
			return true
		}

		const modelValue = this._getModelValueAttribute(name)
		return modelValue.isNil === true
	}

	/**
	 * Create a HTML reset input element.
	 *
	 * @param  string value
	 * @param  array  attributes
	 *
	 * @return SafeString
	 */
	reset(value, attributes = [ ]) {
		return this.input('reset', null, value, attributes)
	}

	/**
	 * Create a HTML image input element.
	 *
	 * @param  string url
	 * @param  string name
	 * @param  array  attributes
	 * @param  bool   secure
	 *
	 * @return SafeString
	 */
	image(url, name = null, attributes = [ ], secure = null) {
		attributes.src = this.app.url.make(url, null, this.req, secure)

		return this.input('image', name, null, attributes)
	}

	/**
	 * Create a color input field.
	 *
	 * @param  string name
	 * @param  string value
	 * @param  object options
	 *
	 * @return SafeString
	 */
	color(name, value = null, options = { }) {
		return this.input('color', name, value, options)
	}

	/**
	 * Create a submit button element.
	 *
	 * @param  string value
	 * @param  object options
	 *
	 * @return SafeString
	 */
	submit(value = null, options = { }) {
		return this.input('submit', null, value, options)
	}

	/**
	 * Create a button element.
	 *
	 * @param  string value
	 * @param  object options
	 *
	 * @return SafeString
	 */
	button(value = null, options = { }) {
		if(options.type.isNil) {
			options.type = 'button'
		}

		return this.toHtmlString(`<button${this.html.attributes(options)}>${value}</button>`)
	}

	/**
	 * Parse the form action method.
	 *
	 * @param  string method
	 *
	 * @return string
	 */
	_getMethod(method) {
		method = method.toUpperCase()

		return method !== 'GET' ? 'POST' : method
	}

	/**
	 * Get the form action from the options.
	 *
	 * @param  object options
	 *
	 * @return string
	 */
	_getAction(options) {
		// We will also check for a "route" or "action" parameter on the array so that
		// developers can easily specify a route or controller action when creating
		// a form providing a convenient interface for creating the form actions.
		if(!options.url.isNil) {
			return this._getUrlAction(options.url)
		}

		if(!options.route.isNil) {
			return this._getRouteAction(options.route)
		}

		if(this.req.isNil) {
			return null
		}

		return this.app.url.make(this.req.path, this.req.query, this.req)
	}

	/**
	 * Get the action for a "url" option.
	 *
	 * @param  object|string options
	 *
	 * @return string
	 */
	_getUrlAction(options) {
		if(typeof options !== 'string') {
			return this.app.url.make(options[0], options.slice(1), this.req)
		}

		return this.app.url.make(options, null, this.req)
	}

	/**
	 * Get the action for a "route" option.
	 *
	 * @param  object|string options
	 *
	 * @return string
	 */
	_getRouteAction(options) {
		if(typeof options !== 'string') {
			return this.app.url.route(options[0], options.slice(1), this.req)
		}

		return this.app.url.route(options, null, this.req)
	}

	/**
	 * Get the form appendage for the given method.
	 *
	 * @param  string method
	 *
	 * @return string
	 */
	_getAppendage(method) {
		let appendage = ''
		method = method.toUpperCase()

		// If the HTTP method is in this list of spoofed methods, we will attach the
		// method spoofer hidden input to the form. This allows us to use regular
		// form to initiate PUT and DELETE requests in addition to the typical.
		if(this.spoofedMethods.indexOf(method) >= 0) {
			appendage += this.hidden('_method', method)
		}

		// If the method is something other than GET we will go ahead and attach the
		// CSRF token to the form, as this can't hurt and is convenient to simply
		// always have available on every form the developers creates for them.
		if(method !== 'GET') {
			appendage += this.token()
		}

		return appendage
	}

	/**
	 * Get the ID attribute for a field name.
	 *
	 * @param  string name
	 * @param  array  attributes
	 *
	 * @return string
	 */
	getIdAttribute(name, attributes) {
		if(!attributes.id.isNil) {
			return attributes.id
		}

		if(this.labels.indexOf(name) >= 0) {
			return name
		}

		return null
	}

	/**
	 * Get the value that should be assigned to the field.
	 *
	 * @param  string name
	 * @param  string value
	 *
	 * @return mixed
	 */
	getValueAttribute(name, value = null) {
		if(name.isNil) {
			return value
		}

		if(name !== '_method') {
			const oldValue = this.old(name)

			if(!oldValue.isNil) {
				return oldValue
			}
		}

		if(!value.isNil) {
			return value
		}

		if(!this._model.isNil) {
			return this._getModelValueAttribute(name)
		}

		return null
	}

	/**
	 * Get the model value that should be assigned to the field.
	 *
	 * @param  string name
	 *
	 * @return mixed
	 */
	_getModelValueAttribute(name) {
		const key = this._transformKey(name)

		if(typeof this._model.getFormValue === 'function') {
			return this._model.getFormValue(key)
		}

		return Obj.get(this._model, key)
	}

	/**
	 * Get a value from the session's old input.
	 *
	 * @param  string name
	 *
	 * @return mixed
	 */
	old(name) {
		if(this.oldInputIsEmpty()) {
			return null
		}

		return Obj.get(this.req.session._old_input, this._transformKey(name), null)
	}

	/**
	 * Determine if the old input is empty.
	 *
	 * @return bool
	 */
	oldInputIsEmpty() {
		return this.req.isNil || this.req.session.isNil || this.req.session._old_input.isNil
	}

	/**
	 * Transform key from array to dot syntax.
	 *
	 * @param  string key
	 *
	 * @return mixed
	 */
	_transformKey(key) {
		return key
			.replace(/\./g, '_')
			.replace(/\[\s*\]/g, '')
			.replace(/\[/g, '.')
			.replace(/\]/g, '')
	}

	/**
	 * Transform the string to an Html serializable object
	 *
	 * @param html
	 *
	 * @return SafeString
	 */
	toHtmlString(html) {
		return this.html.toHtmlString(html)
	}

}
