const GitHub = require('github')

export function GitHubProvider(app) {
	app.github = new GitHub({
		protocol: 'https',
		host: 'api.github.com',
		headers: {
			'User-Agent': 'grind-site',
		},
	})

	const token = app.config.get('github.token')

	if (!token.isNil) {
		app.github.authenticate({
			type: 'token',
			token: token,
		})
	}
}
