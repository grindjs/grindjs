import './ConfigBuilder'
import cacheManager from 'cache-manager'

export function CacheBuilder(config, app, configBuilder = null) {
	configBuilder = configBuilder || ConfigBuilder
	return cacheManager.caching(configBuilder(config, app))
}
