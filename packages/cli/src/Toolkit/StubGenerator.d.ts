export interface StubGenerator {
	generate(stub: string, target: string, context: Record<string, any>): Promise<string>
}
