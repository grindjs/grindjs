import Application from '@grindjs/framework'

import { CacheBuilder } from './CacheBuilder'

export function CacheProvider(app: Application) {
	app.cache = CacheBuilder(app.config.get<string>('cache.default'), app)
}

CacheProvider.priority = 50000
