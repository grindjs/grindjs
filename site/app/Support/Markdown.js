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

Markdown.renderFile = (app, path) => fs.stat(path).then(stats => {
	return app.cache.wrap(`${path}-${stats.mtime.getTime()}`, () => {
		return fs.readFile(path).then(content => Markdown.render(content.toString()))
	})
})

export { Markdown }
