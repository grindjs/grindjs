import Grind from 'grind-framework'

import { AssetsProvider } from 'grind-assets'
import { CacheProvider } from 'grind-cache'
import { HtmlProvider } from 'grind-html'
import { ViewProvider } from 'grind-view'

import 'App/Providers/HttpsProvider'
import 'App/Providers/RoutesProvider'

import 'App/Errors/ErrorHandler'

const app = new Grind({
	errorHandlerClass: ErrorHandler
})

// Framework providers
app.providers.push(AssetsProvider)
app.providers.push(CacheProvider)
app.providers.push(HtmlProvider)
app.providers.push(ViewProvider)

// App providers
app.providers.push(HttpsProvider)
app.providers.push(RoutesProvider)

module.exports = app
