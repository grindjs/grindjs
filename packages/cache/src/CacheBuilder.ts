import Application from '@grindjs/framework'
import cacheManager from 'cache-manager'

import { Config, ConfigBuilder, ConfigBuilderType } from './ConfigBuilder'

export interface CacheBuilderType {
	(
		config: Config | string | null | undefined,
		app: Application,
		configBuilder?: ConfigBuilderType | null | undefined,
	): cacheManager.Cache
}

const CacheBuilder: CacheBuilderType = function (config, app, configBuilder) {
	configBuilder = configBuilder || ConfigBuilder

	const storeConfig = configBuilder(config, app)

	if (!storeConfig) {
		throw new Error('Invalid cache configuration.')
	}

	return cacheManager.caching(storeConfig)
}

export { CacheBuilder }
