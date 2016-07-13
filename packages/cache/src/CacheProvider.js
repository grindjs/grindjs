import './Config'

import cacheManager from 'cache-manager'

export function CacheProvider(app) {
	app.set('cache', cacheManager.caching(Config(app)))
}
