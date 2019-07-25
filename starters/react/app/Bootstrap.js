import { Application } from 'grind-framework'

import { AssetsProvider } from 'grind-assets'
import { CacheProvider } from 'grind-cache'
import { DatabaseProvider } from 'grind-db'
import { HtmlProvider } from 'grind-html'
import { OrmProvider } from 'grind-orm'
import { ViewProvider } from 'grind-view'

import 'App/Providers/RoutesProvider'

export function Bootstrap(kernelClass) {
	const app = new Application(kernelClass)

	// Framework providers
	app.providers.add(AssetsProvider)
	app.providers.add(CacheProvider)
	app.providers.add(DatabaseProvider)
	app.providers.add(HtmlProvider)
	app.providers.add(OrmProvider)
	app.providers.add(ViewProvider)

	// App providers
	app.providers.add(RoutesProvider)

	return app
}
