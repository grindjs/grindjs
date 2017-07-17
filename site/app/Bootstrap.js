import Grind from 'grind-framework'

import { AssetsProvider } from 'grind-assets'
import { CacheProvider } from 'grind-cache'
import { HtmlProvider } from 'grind-html'
import { ViewProvider } from 'grind-view'

import 'App/Providers/HttpsProvider'
import 'App/Providers/RoutesProvider'
import 'App/Providers/ViewExtensionProvider'

import 'App/Errors/ErrorHandler'

const app = new Grind({
	errorHandlerClass: ErrorHandler
})

// Framework providers
app.providers.add(AssetsProvider)
app.providers.add(CacheProvider)
app.providers.add(HtmlProvider)
app.providers.add(ViewProvider)

// App providers
app.providers.add(HttpsProvider)
app.providers.add(RoutesProvider)
app.providers.add(ViewExtensionProvider)

module.exports = app
