import Grind from 'grind-framework'

import { DatabaseProvider } from 'grind-db'
import { OrmProvider } from 'grind-orm'
import { SwaggerProvider } from 'grind-swagger'

import 'App/Providers/RoutesProvider'

const app = new Grind()

app.providers.add(DatabaseProvider)
app.providers.add(OrmProvider)
app.providers.add(SwaggerProvider)
app.providers.add(RoutesProvider)

module.exports = app
