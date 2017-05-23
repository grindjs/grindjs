import 'babel-polyfill'
import test from 'ava'
import './fixtures/makeApp'

import { FS } from 'grind-support'
import readdir from 'recursive-readdir-sync'
import path from 'path'

const viewPath = `${__dirname}/views`

const files = readdir(viewPath).filter(view => view.indexOf('errors/' === -1)).sort((a, b) => {
	const aext = path.extname(a)
	const bext = path.extname(b)

	if(aext === '.stone' && bext !== '.stone') {
		return -1
	} else if(aext !== '.stone' && bext === '.stone') {
		return 1
	}

	return a.localeCompare(b)
})

const candidates = new Set
const tests = new Set

for(const file of files) {
	if(path.extname(file) === '.stone') {
		candidates.add(file)
		continue
	} else if(path.extname(file) !== '.html') {
		continue
	}

	const stone = `${file.substring(0, file.length - 5)}.stone`

	if(!candidates.has(stone)) {
		continue
	}

	tests.add({
		stone: stone,
		html: file
	})
}

for(const { stone, html } of Array.from(tests).sort()) {
	let view = path.relative(viewPath, stone)
	view = view.substring(0, view.length - 6)

	test(view, async t => {
		const app = await makeApp()
		const [ rendered, target ] = await Promise.all([
			app.view.engine.render(view, app.config.get('view.data')).then(rendered => rendered.trim()),
			FS.readFile(html).then(html => html.toString().trim())
		])

		if(rendered === target) {
			return t.pass()
		}

		const compiled = await app.view.engine.compiler.compile(app.view.engine.resolve(view))

		// eslint-disable-next-line max-len
		t.fail(`Rendered Stone does not match expecting HTML:\nStone: '${rendered}'\nTarget: '${target}'\nCompiled: '${compiled}'`)
	})
}
