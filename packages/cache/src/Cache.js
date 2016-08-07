import './Config'

import cacheManager from 'cache-manager'

export function Cache(config, app) {
	return cacheManager.caching(Config(config, app))
}
