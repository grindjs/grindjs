import './CacheBuilder'

export function CacheProvider(app) {
	app.cache = CacheBuilder(app.config.get('cache.default'), app)
}

CacheProvider.priority = 50000
