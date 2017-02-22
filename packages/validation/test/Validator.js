import test from 'ava'
import '../src/Validator'

test('simple', async t => {
	const validator = new Validator

	try {
		await validator.validate({ username: 'abc' }, rule => ({
			username: rule.string().alphanum().min(3).max(30).required(),
			email: rule.string().email()
		}))

		t.pass()
	} catch(err) {
		t.fail('Validation failed')
	}
})

test('custom-mesage', async t => {
	const validator = new Validator

	try {
		await validator.validate({ username: '' }, rule => ({
			username: rule.string().required()
		}), {
			language: {
				any: {
					empty: 'The {{key}} field is not allowed to be empty.',
				}
			}
		})

		t.fail('Validation passed when it should have failed')
	} catch(err) {
		t.is(err.errors.username[0].message, 'The username field is not allowed to be empty.')
	}
})

test('extend', async t => {
	const validator = new Validator

	validator.extend('test', value => {
		if(value !== 'test') {
			throw new Error('invalid test value')
		}

		return value
	})

	try {
		await validator.validate({ test: 'test' }, rule => ({
			test: rule.any().test().required(),
			email: rule.string().email()
		}))

		t.pass('Validation passed')
	} catch(err) {
		t.fail('Validation failed')
	}

	try {
		await validator.validate({ test: 'test2' }, rule => ({
			test: rule.any().test().required(),
			email: rule.string().email()
		}))

		t.fail('Validation passed when it should have failed')
	} catch(err) {
		t.pass('Validation successfully failed')
	}
})
