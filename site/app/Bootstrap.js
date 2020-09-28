import 'App/Providers/GitHubProvider'
import 'App/Providers/HttpsProvider'
import 'App/Providers/RoutesProvider'
import 'App/Providers/ViewExtensionProvider'
import 'App/Errors/ErrorHandler'

import { Application } from '@grindjs/framework'
import { AssetsProvider } from '@grindjs/assets'
import { CacheProvider } from '@grindjs/cache'
import { HtmlProvider } from '@grindjs/html'
import { ViewProvider } from '@grindjs/view'

export function Bootstrap(kernelClass) {
	const app = new Application(kernelClass, {
		errorHandlerClass: ErrorHandler,
	})

	// Framework providers
	app.providers.add(AssetsProvider)
	app.providers.add(CacheProvider)
	app.providers.add(HtmlProvider)
	app.providers.add(ViewProvider)

	// App providers
	app.providers.add(GitHubProvider)
	app.providers.add(HttpsProvider)
	app.providers.add(RoutesProvider)
	app.providers.add(ViewExtensionProvider)

	return app
}
