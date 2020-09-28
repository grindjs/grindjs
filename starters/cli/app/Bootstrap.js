import { Application } from '@grindjs/framework'

export function Bootstrap(kernelClass) {
	const app = new Application(kernelClass)

	// app.providers.add(SomeProvider)

	return app
}
