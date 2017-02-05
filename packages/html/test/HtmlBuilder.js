import test from 'ava'

import '../src/HtmlBuilder'
import './helpers/Grind'

function htmlBuilder() {
	return new HtmlBuilder(new Grind)
}

test('dl', t => {
	t.is(
		htmlBuilder().dl({ foo: 'bar', bing: 'baz' }, { class: 'example' }).toString(),
		'<dl class="example"><dt>foo</dt><dd>bar</dd><dt>bing</dt><dd>baz</dd></dl>'
	)
})

test('ol', t => {
	t.is(
		htmlBuilder().ol([ 'foo', 'bar', '&amp;' ], { class: 'example' }).toString(),
		'<ol class="example"><li>foo</li><li>bar</li><li>&amp;amp;</li></ol>'
	)
})

test('ul', t => {
	t.is(
		htmlBuilder().ul([ 'foo', 'bar', '&amp;' ], { class: 'example' }).toString(),
		'<ul class="example"><li>foo</li><li>bar</li><li>&amp;amp;</li></ul>'
	)
})

test('meta', t => {
	t.is(
		htmlBuilder().meta('description', 'Lorem ipsum dolor sit amet.').toString(),
		'<meta name="description" content="Lorem ipsum dolor sit amet." />\n'
	)
})

test('tag', t => {
	const html = htmlBuilder()

	t.is(
		html.tag('p', 'Lorem ipsum dolor sit amet.').toString(),
		'<p>\nLorem ipsum dolor sit amet.\n</p>\n'
	)

	t.is(
		html.tag('p', 'Lorem ipsum dolor sit amet.', { class: 'text-center' }).toString(),
		'<p class="text-center">\nLorem ipsum dolor sit amet.\n</p>\n'
	)

	t.is(
		html.tag('div', '<p>Lorem ipsum dolor sit amet.</p>', { class: 'row' }).toString(),
		'<div class="row">\n<p>Lorem ipsum dolor sit amet.</p>\n</div>\n'
	)

	t.is(
		html.tag('div', [
			html.image('http://example.com/image1'),
			html.image('http://example.com/image2'),
		], { class: 'row' }).toString(),
		'<div class="row">\n<img src="http://example.com/image1" />\n<img src="http://example.com/image2" />\n</div>\n'
	)
})

test('meta og', t => {
	t.is(
		htmlBuilder().meta(null, 'website', { property: 'og:type' }).toString(),
		'<meta content="website" property="og:type" />\n'
	)
})

test('favicon', t => {
	t.is(
		htmlBuilder().favicon('http://foo.com/bar.ico').toString(),
		'<link rel="shortcut icon" type="image/x-icon" href="http://foo.com/bar.ico" />\n'
	)
})

test('link', t => {
	const html = htmlBuilder()

	t.is(
		html.link('http://www.example.com', '<span>Example.com</span>', { class: 'example-link' }, null, true).toString(),
		'<a href="http://www.example.com" class="example-link">&lt;span&gt;Example.com&lt;/span&gt;</a>'
	)

	t.is(
		html.link('http://www.example.com', '<span>Example.com</span>', { class: 'example-link' }, null, false).toString(),
		'<a href="http://www.example.com" class="example-link"><span>Example.com</span></a>'
	)
})
