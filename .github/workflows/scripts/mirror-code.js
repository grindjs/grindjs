#!/usr/bin/env node
const log = require('./utils/log')
const git = require('./utils/git')

const [, branch] = (process.env.GITHUB_REF || '').match(/^refs\/heads\/(.+?)$/) || []

if (!branch) {
	throw new Error('Branch not detected')
}

for (const [pathname, { repo }] of Object.entries(require('./mirrors.json'))) {
	log.info(`Mirroring ${pathname} to ${repo}#${branch}`)
	const slug = pathname.replace(/[^a-z]+/gi, '-')
	git('subtree', 'split', '-P', pathname, '-b', slug)
	git('remote', 'add', slug, repo)

	if (branch === 'master') {
		git('push', slug, `${slug}:main`, '--force')
	}

	git('push', slug, `${slug}:${branch}`, '--force')
}
