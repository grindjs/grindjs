import './helpers/test'
import '../src/ModelNotFoundError'

test('findById', async t => {
	const model = await t.context.UserModel.findById(1)
	t.is(model.id, 1)
})

test('findByIdOrFail', async t => {
	const model = await t.context.UserModel.findByIdOrFail(1)
	t.is(model.id, 1)

	try {
		t.context.UserModel.findByIdOrFail(Date.now())
	} catch(err) {
		if(err instanceof ModelNotFoundError) {
			return t.pass()
		}

		throw err
	}
})
