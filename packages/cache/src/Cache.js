import './ConfigBuilder'
import cacheManager from 'cache-manager'

export function Cache(config, app) {
	return cacheManager.caching(ConfigBuilder(config, app))
}
