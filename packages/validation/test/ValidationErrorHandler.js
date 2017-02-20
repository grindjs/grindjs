import test from 'ava'
import '../src/Validator'
import '../src/ValidationErrorHandler'

test('json', async t => {
	const validator = new Validator

	try {
		await validator.validate({ username: 'a' }, rule => ({
			username: rule.string().alphanum().min(3).max(30).required()
		}))

		t.fail('Validation should have failed')
	} catch(err) {
		const response = ValidationErrorHandler(err, { xhr: true }, { })
		t.is(response.code, 400)
		t.is(response.error, '"username" length must be at least 3 characters long')
		t.deepEqual(response.violations, { ...err.errors })
	}
})

test('redirect', async t => {
	const validator = new Validator

	try {
		await validator.validate({ username: 'a' }, rule => ({
			username: rule.string().alphanum().min(3).max(30).required()
		}))

		t.fail('Validation should have failed')
	} catch(err) {
		const flash = { }
		let redirect = null

		ValidationErrorHandler(err, {
			headers: {
				referer: 'redirect'
			}
		}, {
			flash: (key, value) => {
				flash[key] = value
			},

			flashInput: () => {
				flash._input = true
			},

			redirect: value => {
				redirect = value
			}
		})

		t.is(redirect, 'redirect')
		t.is(flash._input, true)
		t.deepEqual(flash.errors, { ...err.errors })
	}
})

test('no-redirect', async t => {
	const validator = new Validator

	try {
		await validator.validate({ username: 'a' }, rule => ({
			username: rule.string().alphanum().min(3).max(30).required()
		}))

		t.fail('Validation should have failed')
	} catch(err) {
		const response = ValidationErrorHandler(err, { }, {
			flash: () => { },
			flashInput: () => { },
			redirect: () => { }
		})

		t.is(response.code, 400)
	}
})
