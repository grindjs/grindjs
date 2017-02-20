/* eslint-disable max-len */
import 'babel-polyfill'
import test from 'ava'
import dateFormat from 'dateformat'
import { Obj } from 'grind-support'

import '../src/HtmlBuilder'
import '../src/FormBuilder'
import './helpers/Grind'

function formBuilder(oldInput) {
	const app = new Grind
	const form = new FormBuilder(app, new HtmlBuilder(app))

	form.req = {
		path: 'foo',
		session: { },
		get: () => 'localhost'
	}

	if(!oldInput.isNil) {
		form._oldInput = oldInput
	}

	return form
}

test('opening form', t => {
	const form = formBuilder()

	t.is(
		form.open({ method: 'GET' }).toString(),
		'<form method="GET" action="http://localhost/foo" accept-charset="UTF-8">'
	)

	t.is(
		form.open({ method: 'POST', class: 'form', id: 'id-form' }).toString(),
		'<form method="POST" action="http://localhost/foo" accept-charset="UTF-8" class="form" id="id-form">'
	)

	t.is(
		form.open({ method: 'GET', 'accept-charset': 'UTF-16' }).toString(),
		'<form method="GET" action="http://localhost/foo" accept-charset="UTF-16">'
	)

	t.is(
		form.open({ method: 'GET', 'accept-charset': 'UTF-16', files: true }).toString(),
		'<form method="GET" action="http://localhost/foo" accept-charset="UTF-16" enctype="multipart/form-data">'
	)

	t.is(
		form.open({ method: 'PUT' }).toString(),
		'<form method="POST" action="http://localhost/foo?_method=PUT" accept-charset="UTF-8">'
	)
})

test('closing form', t => {
	t.is(
		formBuilder().close().toString(),
		'</form>'
	)
})

test('form label', t => {
	const form = formBuilder()

	t.is(
		form.label('foo', 'Foobar').toString(),
		'<label for="foo">Foobar</label>'
	)

	t.is(
		form.label('foo', 'Foobar', { class: 'control-label' }).toString(),
		'<label for="foo" class="control-label">Foobar</label>'
	)

	t.is(
		form.label('foo', 'Foobar <i>bar</i>', null, false).toString(),
		'<label for="foo">Foobar <i>bar</i></label>'
	)
})

test('form input', t => {
	const form = formBuilder()

	t.is(
		form.input('text', 'foo').toString(),
		'<input name="foo" type="text" />'
	)

	t.is(
		form.input('text', 'foo', 'foobar').toString(),
		'<input name="foo" type="text" value="foobar" />'
	)

	t.is(
		form.input('date', 'foobar', null, { class: 'span2' }).toString(),
		'<input class="span2" name="foobar" type="date" />'
	)
})

test('passwords not filled', t => {
	t.is(
		formBuilder().password('password').toString(),
		'<input name="password" type="password" value="" />'
	)
})

test('file not filled', t => {
	t.is(
		formBuilder().file('img').toString(),
		'<input name="img" type="file" />'
	)
})

test('form text', t => {
	const form = formBuilder()

	t.is(
		form.input('text', 'foo').toString(),
		'<input name="foo" type="text" />'
	)

	t.is(
		form.input('text', 'foo').toString(),
		form.text('foo').toString()
	)

	t.is(
		form.text('foo', 'foobar').toString(),
		'<input name="foo" type="text" value="foobar" />'
	)

	t.is(
		form.text('foo', null, { class: 'span2' }).toString(),
		'<input class="span2" name="foo" type="text" />'
	)
})

test('form text repopulation', t => {
	const form = formBuilder({
		name_with_dots: 'some value',
		text: {
			key: {
				sub: null
			}
		},
		relation: {
			key: null
		}
	})

	const model = { relation: { key: 'attribute' }, other: 'val' }
	setModel(form, model)

	t.is(
		form.text('name.with.dots', 'default value').toString(),
		'<input name="name.with.dots" type="text" value="some value" />'
	)

	t.is(
		form.text('text[key][sub]', 'default value').toString(),
		'<input name="text[key][sub]" type="text" value="default value" />'
	)

	const input1 = form.text('relation[key]')
	setModel(form, model, false)
	const input2 = form.text('relation[key]')

	t.is(input1.toString(), '<input name="relation[key]" type="text" value="attribute" />')
	t.is(input1.toString(), input2.toString())
})

test('form repopulation with mix of arrays and objects', t => {
	const form = formBuilder()

	form.model({ user: { password: 'apple' } })
	t.is(
		form.text('user[password]').toString(),
		'<input name="user[password]" type="text" value="apple" />'
	)

	form.model({ letters: [ 'a', 'b', 'c' ] })
	t.is(
		form.text('letters[1]').toString(),
		'<input name="letters[1]" type="text" value="b" />'
	)
})

test('form password', t => {
	const form = formBuilder()

	t.is(
		form.password('foo').toString(),
		'<input name="foo" type="password" value="" />'
	)

	t.is(
		form.password('foo', { class: 'span2' }).toString(),
		'<input class="span2" name="foo" type="password" value="" />'
	)
})

test('form hidden', t => {
	const form = formBuilder()

	t.is(
		form.hidden('foo').toString(),
		'<input name="foo" type="hidden" />'
	)

	t.is(
		form.hidden('foo', 'foobar').toString(),
		'<input name="foo" type="hidden" value="foobar" />'
	)

	t.is(
		form.hidden('foo', null, { class: 'span2' }).toString(),
		'<input class="span2" name="foo" type="hidden" />'
	)
})

test('form email', t => {
	const form = formBuilder()

	t.is(
		form.email('foo').toString(),
		'<input name="foo" type="email" />'
	)

	t.is(
		form.email('foo', 'foobar').toString(),
		'<input name="foo" type="email" value="foobar" />'
	)

	t.is(
		form.email('foo', null, { class: 'span2' }).toString(),
		'<input class="span2" name="foo" type="email" />'
	)
})

test('form tel', t => {
	const form = formBuilder()

	t.is(
		form.tel('foo').toString(),
		'<input name="foo" type="tel" />'
	)

	t.is(
		form.tel('foo', 'foobar').toString(),
		'<input name="foo" type="tel" value="foobar" />'
	)

	t.is(
		form.tel('foo', null, { class: 'span2' }).toString(),
		'<input class="span2" name="foo" type="tel" />'
	)
})

test('form number', t => {
	const form = formBuilder()

	t.is(
		form.number('foo').toString(),
		'<input name="foo" type="number" />'
	)

	t.is(
		form.number('foo', 1).toString(),
		'<input name="foo" type="number" value="1" />'
	)

	t.is(
		form.number('foo', null, { class: 'span2' }).toString(),
		'<input class="span2" name="foo" type="number" />'
	)
})

test('form date', t => {
	const form = formBuilder()

	t.is(
		form.date('foo').toString(),
		'<input name="foo" type="date" />'
	)

	t.is(
		form.date('foo', '2015-02-20').toString(),
		'<input name="foo" type="date" value="2015-02-20" />'
	)

	t.is(
		form.date('foo', new Date).toString(),
		`<input name="foo" type="date" value="${dateFormat(new Date, 'yyyy-mm-dd')}" />`
	)

	t.is(
		form.date('foo', null, { class: 'span2' }).toString(),
		'<input class="span2" name="foo" type="date" />'
	)
})

test('form time', t => {
	const form = formBuilder()

	t.is(
		form.time('foo').toString(),
		'<input name="foo" type="time" />'
	)

	t.is(
		form.time('foo', dateFormat(new Date, 'HH:MM')).toString(),
		`<input name="foo" type="time" value="${dateFormat(new Date, 'HH:MM')}" />`
	)

	t.is(
		form.time('foo', null, { class: 'span2' }).toString(),
		'<input class="span2" name="foo" type="time" />'
	)
})

test('form file', t => {
	const form = formBuilder()

	t.is(
		form.file('foo').toString(),
		'<input name="foo" type="file" />'
	)

	t.is(
		form.file('foo', { class: 'span2' }).toString(),
		'<input class="span2" name="foo" type="file" />'
	)
})

test('form textarea', t => {
	const form = formBuilder()

	t.is(
		form.textarea('foo').toString(),
		'<textarea name="foo" cols="50" rows="10"></textarea>'
	)

	t.is(
		form.textarea('foo', 'foobar').toString(),
		'<textarea name="foo" cols="50" rows="10">foobar</textarea>'
	)

	t.is(
		form.textarea('foo', null, { class: 'span2' }).toString(),
		'<textarea class="span2" name="foo" cols="50" rows="10"></textarea>'
	)

	t.is(
		form.textarea('foo', null, { size: '60x15' }).toString(),
		'<textarea name="foo" cols="60" rows="15"></textarea>'
	)

	t.is(
		form.textarea('encoded_html', '&amp;').toString(),
		'<textarea name="encoded_html" cols="50" rows="10">&amp;amp;</textarea>'
	)
})

test('select', t => {
	const form = formBuilder()

	t.is(
		form.select('size', { L: 'Large', S: 'Small' }).toString(),
		'<select name="size"><option value="L">Large</option><option value="S">Small</option></select>'
	)

	t.is(
		form.select('size', { L: 'Large', S: 'Small' }, 'L').toString(),
		'<select name="size"><option value="L" selected="selected">Large</option><option value="S">Small</option></select>'
	)

	t.is(
		form.select(
			'size',
			{ L: 'Large', S: 'Small' },
			null,
			{ class: 'class-name', id: 'select-id' }
		).toString(),
		'<select class="class-name" id="select-id" name="size"><option value="L">Large</option><option value="S">Small</option></select>'
	)

	form.label('select-name-id')
	t.is(
		form.select(
			'select-name-id',
			[],
			null,
			{ name: 'select-name' }
		).toString(),
		'<select name="select-name" id="select-name-id"></select>'
	)

	t.is(
		form.select(
			'size',
			{
				'Large sizes': {
					L: 'Large',
					XL: 'Extra Large',
				},
				S: 'Small',
			},
			null,
			{
				class: 'class-name',
				id: 'select-id',
			}
		).toString(),
		'<select class="class-name" id="select-id" name="size"><optgroup label="Large sizes"><option value="L">Large</option><option value="XL">Extra Large</option></optgroup><option value="S">Small</option></select>'
	)

	t.is(
		form.select(
			'encoded_html',
			{ no_break_space: '&nbsp;', ampersand: '&amp;', lower_than: '&lt;' },
			null
		).toString(),
		'<select name="encoded_html"><option value="no_break_space">&amp;nbsp;</option><option value="ampersand">&amp;amp;</option><option value="lower_than">&amp;lt;</option></select>'
	)
})

test('form select repopulation', t => {
	let form = formBuilder({
		size: 'M'
	})

	const list = { L: 'Large', M: 'Medium', S: 'Small' }
	const model = { size: { key: 'S' }, other: 'val' }
	setModel(form, model)

	t.is(
		form.select('size', list, 'S').toString(),
		'<select name="size"><option value="L">Large</option><option value="M" selected="selected">Medium</option><option value="S">Small</option></select>'
	)

	form = formBuilder({
		size: {
			multi: [ 'L', 'S' ],
			key: null
		}
	})
	setModel(form, model)

	t.is(
		form.select('size[multi][]', list, 'M', { multiple: 'multiple' }).toString(),
		'<select multiple="multiple" name="size[multi][]"><option value="L" selected="selected">Large</option><option value="M">Medium</option><option value="S" selected="selected">Small</option></select>'
	)

	t.is(
		form.select('size[key]', list).toString(),
		'<select name="size[key]"><option value="L">Large</option><option value="M">Medium</option><option value="S" selected="selected">Small</option></select>'
	)
})

test('form with optional placeholder', t => {
	const form = formBuilder()

	t.is(
		form.select(
			'size',
			{ L: 'Large', S: 'Small' },
			null,
			{ placeholder: 'Select One...' }
		).toString(),
		'<select name="size"><option selected="selected" value="">Select One...</option><option value="L">Large</option><option value="S">Small</option></select>'
	)

	t.is(
		form.select(
			'size',
			{ L: 'Large', S: 'Small' },
			'L',
			{ placeholder: 'Select One...' }
		).toString(),
		'<select name="size"><option value="">Select One...</option><option value="L" selected="selected">Large</option><option value="S">Small</option></select>'
	)

	t.is(
		form.select(
			'encoded_html',
			{ no_break_space: '&nbsp;', ampersand: '&amp;', lower_than: '&lt;' },
			null,
			{ placeholder: 'Select the &nbsp;' }
		).toString(),
		'<select name="encoded_html"><option selected="selected" value="">Select the &amp;nbsp;</option><option value="no_break_space">&amp;nbsp;</option><option value="ampersand">&amp;amp;</option><option value="lower_than">&amp;lt;</option></select>'
	)
})

test('form select year', t => {
	const form = formBuilder()

	t.is(
		form.selectYear('year', 2000, 2020).toString().substring(0, 88),
		'<select name="year"><option value="2000">2000</option><option value="2001">2001</option>'
	)

	t.is(
		form.selectYear('year', 2000, 2020, null, { id: 'foo' }).toString().substring(0, 97),
		'<select id="foo" name="year"><option value="2000">2000</option><option value="2001">2001</option>'
	)

	t.is(
		form.selectYear('year', 2000, 2020, '2000').toString().substring(0, 108),
		'<select name="year"><option value="2000" selected="selected">2000</option><option value="2001">2001</option>'
	)
})

test('form select range', t => {
	const range = formBuilder().selectRange('dob', 1900, 2013).toString()

	t.is(
		range.substring(0, 53),
		'<select name="dob"><option value="1900">1900</option>'
	)

	t.is(
		range.indexOf('<option value="2013">2013</option>') >= 0,
		true
	)
})

test('form select month', t => {
	const form = formBuilder()

	t.is(
		form.selectMonth('month').toString().substring(0, 90),
		'<select name="month"><option value="1">January</option><option value="2">February</option>'
	)

	t.is(
		form.selectMonth('month', '1').toString().substring(0, 75),
		'<select name="month"><option value="1" selected="selected">January</option>'
	)

	t.is(
		form.selectMonth('month', null, { id: 'foo' }).toString().substring(0, 64),
		'<select id="foo" name="month"><option value="1">January</option>'
	)
})

test('form checkbox', t => {
	const form = formBuilder()

	t.is(
		form.input('checkbox', 'foo').toString(),
		'<input name="foo" type="checkbox" />'
	)

	t.is(
		form.checkbox('foo').toString(),
		'<input name="foo" type="checkbox" value="1" />'
	)

	t.is(
		form.checkbox('foo', 'foobar', true).toString(),
		'<input checked="checked" name="foo" type="checkbox" value="foobar" />'
	)

	t.is(
		form.checkbox('foo', 'foobar', false, { class: 'span2' }).toString(),
		'<input class="span2" name="foo" type="checkbox" value="foobar" />'
	)
})

test('form checkbox repopulation', t => {
	let form = formBuilder({
		check: null
	})

	t.is(
		form.checkbox('check', 1, true).toString(),
		'<input name="check" type="checkbox" value="1" />'
	)

	form = formBuilder({
		check: {
			key: 'yes'
		}
	})

	t.is(
		form.checkbox('check[key]', 'yes').toString(),
		'<input checked="checked" name="check[key]" type="checkbox" value="yes" />'
	)

	form = formBuilder({
		multicheck: [ 1, 3 ]
	})

	t.is(
		form.checkbox('multicheck[]', 1).toString(),
		'<input checked="checked" name="multicheck[]" type="checkbox" value="1" />'
	)

	t.is(
		form.checkbox('multicheck[]', 2, true).toString(),
		'<input name="multicheck[]" type="checkbox" value="2" />'
	)

	t.is(
		form.checkbox('multicheck[]', 3).toString(),
		'<input checked="checked" name="multicheck[]" type="checkbox" value="3" />'
	)
})

test('form checkbox with model relation', t => {
	const form = formBuilder()
	setModel(form, { items: [ 2, 3 ] })

	t.is(
		form.checkbox('items[]', 1).toString(),
		'<input name="items[]" type="checkbox" value="1" />'
	)

	t.is(
		form.checkbox('items[]', 2).toString(),
		'<input checked="checked" name="items[]" type="checkbox" value="2" />'
	)

	t.is(
		form.checkbox('items[]', 3, false).toString(),
		'<input name="items[]" type="checkbox" value="3" />'
	)

	t.is(
		form.checkbox('items[]', 4, true).toString(),
		'<input checked="checked" name="items[]" type="checkbox" value="4" />'
	)
})

test('form checkbox without session', t => {
	const form = formBuilder()

	t.is(
		form.checkbox('foo').toString(),
		'<input name="foo" type="checkbox" value="1" />'
	)

	t.is(
		form.checkbox('foo', 'foobar', true).toString(),
		'<input checked="checked" name="foo" type="checkbox" value="foobar" />'
	)
})

test('form radio', t => {
	const form = formBuilder()

	t.is(
		form.input('radio', 'foo').toString(),
		'<input name="foo" type="radio" />'
	)

	t.is(
		form.radio('foo').toString(),
		'<input name="foo" type="radio" value="foo" />'
	)

	t.is(
		form.radio('foo', 'foobar', true).toString(),
		'<input checked="checked" name="foo" type="radio" value="foobar" />'
	)

	t.is(
		form.radio('foo', 'foobar', false, { class: 'span2' }).toString(),
		'<input class="span2" name="foo" type="radio" value="foobar" />'
	)
})

test('form radio repopulation', t => {
	const form = formBuilder({
		radio: 1
	})

	t.is(
		form.radio('radio', 1).toString(),
		'<input checked="checked" name="radio" type="radio" value="1" />'
	)

	t.is(
		form.radio('radio', 2, true).toString(),
		'<input name="radio" type="radio" value="2" />'
	)
})

test('form submit', t => {
	const form = formBuilder()

	t.is(
		form.submit('foo').toString(),
		'<input type="submit" value="foo" />'
	)

	t.is(
		form.submit('foo', { class: 'span2' }).toString(),
		'<input class="span2" type="submit" value="foo" />'
	)
})

test('form button', t => {
	const form = formBuilder()

	t.is(
		form.button('foo').toString(),
		'<button type="button">foo</button>'
	)

	t.is(
		form.button('foo', { class: 'span2' }).toString(),
		'<button class="span2" type="button">foo</button>'
	)
})

test('reset input', t => {
	t.is(
		formBuilder().reset('foo').toString(),
		'<input type="reset" value="foo" />'
	)
})

test('image input', t => {
	const url = 'http://grind.rocks/'

	t.is(
		formBuilder().image(url).toString(),
		`<input src="${url}" type="image" />`
	)
})

test('form color', t => {
	const form = formBuilder()

	t.is(
		form.color('foo').toString(),
		'<input name="foo" type="color" />'
	)

	t.is(
		form.color('foo', '#ff0000').toString(),
		'<input name="foo" type="color" value="#ff0000" />'
	)

	t.is(
		form.color('foo', null, { class: 'span2' }).toString(),
		'<input class="span2" name="foo" type="color" />'
	)
})

function setModel(form, data, object = true) {
	if(object) {
		data = new FormBuilderModelStub(data)
	}

	return form.model(data, { method: 'GET' })
}

class FormBuilderModelStub {
	data = null

	constructor(data = { }) {
		this.data = data
	}

	getFormValue(key) {
		return Obj.get(this.data, key)
	}

}
