#!/usr/bin/env node
const log = require('./utils/log')
const git = require('./utils/git')

const [, tag] = (process.env.GITHUB_REF || '').match(/^refs\/tags\/(v.+?)$/) || []

if (!tag) {
	throw new Error('Valid tag not detected')
}

for (const [pathname, repo] of Object.entries(require('./mirrors.json'))) {
	log.info(`Mirroring ${pathname} to ${repo}`)
	const slug = pathname.replace(/[^a-z]+/gi, '-')
	git('subtree', 'split', '-P', pathname, '-b', slug)
	git('remote', 'add', slug, repo)
	git('tag', tag, slug, '--force')
	git('push', slug, tag, '--force')
}
