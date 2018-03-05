import '../Support/StubGenerator'

export function StubGeneratorProvider(app) {
	app.stubs = new StubGenerator(app)
}
