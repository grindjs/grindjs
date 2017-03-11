/* eslint-disable max-len */
import test from 'ava'
import '../src/StoneEngine'

const engine = new StoneEngine(`${__dirname}/fixtures`)

function compile(stone) {
	return engine.compiler.compileString(stone).toString()
}

function wrap(code) {
	return `function (_, _sections = { }) {\nlet output = \'\';\n${code}\n\nreturn output;\n}`
}

test('section', t => {
	t.is(
		compile('@section(\'grind\')@endsection'),
		wrap('(_sections[\'grind\'] = _sections[\'grind\'] || []).unshift(function () {\n\tlet output = \'\';\n\treturn output;\n});')
	)
})

test('super', t => {
	t.is(
		compile('@section(\'grind\')@super@endsection'),
		wrap('(_sections[\'grind\'] = _sections[\'grind\'] || []).unshift(function () {\n\tlet output = \'\';\n\toutput += (_sections[\'grind\'] || []).length > 0 ? _sections[\'grind\'].pop()() : \'\';\n\treturn output;\n});')
	)
})

test('show', t => {
	t.is(
		compile('@section(\'grind\')@show'),
		wrap('(_sections[\'grind\'] = _sections[\'grind\'] || []).unshift(function () {\n\tlet output = \'\';\n\treturn output;\n});\noutput += (_sections[\'grind\'] || []).length > 0 ? _sections[\'grind\'].pop()() : \'\';')
	)
})
