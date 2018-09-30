import test from 'ava'

import './fixtures/makeApp'

import '../src/Errors/StoneCompilerError'
import '../src/Errors/StoneSyntaxError'

function parseErrorFrame(err) {
	const match = err.stack.match(/([^(]+?):(\d+):(\d+)/)

	return {
		file: match[1],
		line: Number.parseInt(match[2]),
		column: Number.parseInt(match[3])
	}
}

test('invalid-directive', async t => {
	const app = await makeApp()
	const template = 'errors.invalid-directive'

	try {
		await app.view.engine.render(template, app.config.get('view.data'))
		t.fail('Test should have thrown an error.')
	} catch(err) {
		if(!(err instanceof StoneCompilerError)) {
			throw err
		}

		const frame = parseErrorFrame(err)
		t.is(frame.file, app.view.engine.resolve(template))
		t.is(frame.line, 3)
		t.is(frame.column, 2)
	}
})

test('syntax-error', async t => {
	const app = await makeApp()
	const template = 'errors.syntax-error'

	try {
		await app.view.engine.render(template, app.config.get('view.data'))
		t.fail('Test should have thrown an error.')
	} catch(err) {
		if(!(err instanceof StoneSyntaxError)) {
			throw err
		}

		const frame = parseErrorFrame(err)
		t.is(frame.file, app.view.engine.resolve(template))
		t.is(frame.line, 2)
		t.is(frame.column, 1)
	}
})
