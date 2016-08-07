import './Cache'

export function CacheProvider(app) {
	app.cache = Cache(app.config.get('cache.default'), app)
}

CacheProvider.priority = 50000
