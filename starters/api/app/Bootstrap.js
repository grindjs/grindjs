import { Application } from 'grind-framework'

import { DatabaseProvider } from 'grind-db'
import { OrmProvider } from 'grind-orm'
import { SwaggerProvider } from 'grind-swagger'

import 'App/Providers/RoutesProvider'

export function Bootstrap(kernelClass) {
	const app = new Application(kernelClass)

	app.providers.add(DatabaseProvider)
	app.providers.add(OrmProvider)
	app.providers.add(SwaggerProvider)
	app.providers.add(RoutesProvider)

	return app
}
