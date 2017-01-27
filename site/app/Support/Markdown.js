import MarkdownIt from 'markdown-it'

import fs from 'fs-promise'
import expandTabs from 'markdown-it-expand-tabs'
import githubTaskList from 'markdown-it-task-lists'
import Highlights from 'highlights'

const highlighter = new Highlights()

const Markdown = new MarkdownIt({
	html: true,
	linkify: true,
	typographer: true,
	highlight: (code, lang) => {
		return highlighter.highlightSync({
			fileContents: code,
			scopeName: `source.${lang}`
		})
	}
})

Markdown.use(expandTabs)
Markdown.use(githubTaskList)

Markdown.render = function(content) {
	let result = MarkdownIt.prototype.render.call(this, content)
	result = result.replace(/<blockquote>\s*<p>\s*\{([a-z]+)\}\s*/g, '<blockquote class="blockquote-$1"><p>')
	return result
}

Markdown.renderFile = (app, path) => {
	const render = () => fs.readFile(path).then(content => Markdown.render(content.toString()))

	if(app.debug) {
		return render()
	}

	return fs.stat(path).then(stats => app.cache.wrap(`${path}-${stats.mtime.getTime()}`, render))
}

export { Markdown }
