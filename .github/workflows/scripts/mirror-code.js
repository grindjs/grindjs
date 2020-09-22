#!/usr/bin/env node
const log = require('./utils/log')
const git = require('./utils/git')

for (const [pathname, repo] of Object.entries(require('./mirrors.json'))) {
	log.info(`Mirroring ${pathname} to ${repo}`)
	const slug = pathname.replace(/[^a-z]+/gi, '-')
	git('subtree', 'split', '-P', pathname, '-b', slug)
	git('remote', 'add', slug, repo)
	git('push', slug, `${slug}:main`, '--force')
	git('push', slug, `${slug}:master`, '--force')
}
