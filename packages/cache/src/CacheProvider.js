import './Config'

import cacheManager from 'cache-manager'

export function CacheProvider(app) {
	app.cache = cacheManager.caching(Config(app))
}
