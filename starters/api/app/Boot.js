import Grind from 'grind-framework'

import {provider as DatabaseProvider} from 'grind-db'
import {provider as SwaggerProvider} from 'grind-swagger'

import 'App/Providers/RoutesProvider'
import 'App/Providers/ErrorsProvider'

const app = new Grind()

app.providers.push(DatabaseProvider)
app.providers.push(SwaggerProvider)
app.providers.push(ErrorsProvider)
app.providers.push(RoutesProvider)

module.exports = app
