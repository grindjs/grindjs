import Grind from 'grind-framework'

import {DatabaseProvider} from 'grind-db'
import {SwaggerProvider} from 'grind-swagger'

import 'App/Providers/RoutesProvider'

const app = new Grind()

app.providers.push(DatabaseProvider)
app.providers.push(SwaggerProvider)
app.providers.push(RoutesProvider)

module.exports = app
