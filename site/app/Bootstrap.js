import Grind from 'grind-framework'

import {AssetsProvider} from 'grind-assets'
import {CacheProvider} from 'grind-cache'
import {DatabaseProvider} from 'grind-db'
import {HtmlProvider} from 'grind-html'
import {OrmProvider} from 'grind-orm'
import {ViewProvider} from 'grind-view'

import 'App/Providers/RoutesProvider'
import 'App/Errors/ErrorHandler'

const app = new Grind({
	errorHandlerClass: ErrorHandler
})

// Framework providers
app.providers.push(AssetsProvider)
app.providers.push(CacheProvider)
app.providers.push(DatabaseProvider)
app.providers.push(HtmlProvider)
app.providers.push(OrmProvider)
app.providers.push(ViewProvider)

// App providers
app.providers.push(RoutesProvider)

module.exports = app
