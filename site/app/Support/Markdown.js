import MarkdownIt from 'markdown-it'

import fs from 'fs'
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

Markdown.renderFile = path => new Promise((resolve, reject) => {
	fs.readFile(path, (err, content) => {
		if(!err.isNil) {
			return reject(err)
		}

		return resolve(content.toString())
	})
}).then(content => Markdown.render(content))

export { Markdown }
