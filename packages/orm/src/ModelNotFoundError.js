export class ModelNotFoundError extends NotFoundError {

	constructor(model) {
		super(`${model.describe()} Not found`)
	}

}
