import Grind from 'grind-framework'

import {DatabaseProvider} from 'grind-db'
import {SwaggerProvider} from 'grind-swagger'

import 'App/Providers/RoutesProvider'
import 'App/Providers/ErrorHandlerProvider'

const app = new Grind()

app.providers.push(DatabaseProvider)
app.providers.push(SwaggerProvider)
app.providers.push(RoutesProvider)

// ExpressJS requires error middleware be
// registered last.
app.providers.push(ErrorHandlerProvider)

module.exports = app
