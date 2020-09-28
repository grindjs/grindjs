import 'App/Providers/RoutesProvider'

import { Application } from '@grindjs/framework'
import { DatabaseProvider } from '@grindjs/db'
import { OrmProvider } from '@grindjs/orm'
import { SwaggerProvider } from '@grindjs/swagger'

export function Bootstrap(kernelClass) {
	const app = new Application(kernelClass)

	app.providers.add(DatabaseProvider)
	app.providers.add(OrmProvider)
	app.providers.add(SwaggerProvider)
	app.providers.add(RoutesProvider)

	return app
}
