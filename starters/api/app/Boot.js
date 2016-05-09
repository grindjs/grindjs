import Grind from 'grind-framework'

import {provider as DatabaseProvider} from 'grind-db'
import {provider as SwaggerProvider} from 'grind-swagger'
import {RoutesProvider} from 'App/Providers/RoutesProvider'

const app = new Grind()

app.providers.push(DatabaseProvider)
app.providers.push(SwaggerProvider)
app.providers.push(RoutesProvider)

module.exports = app
