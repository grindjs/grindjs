import 'App/Providers/RoutesProvider'
import 'App/Errors/ErrorHandler'

import { Application } from '@grindjs/framework'
import { AssetsProvider } from '@grindjs/assets'
import { CacheProvider } from '@grindjs/cache'
import { DatabaseProvider } from '@grindjs/db'
import { HtmlProvider } from '@grindjs/html'
import { OrmProvider } from '@grindjs/orm'
import { ViewProvider } from '@grindjs/view'

export function Bootstrap(kernelClass) {
	const app = new Application(kernelClass, {
		errorHandlerClass: ErrorHandler,
	})

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
