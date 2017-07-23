/**
 * Register a property on the target that will be
 * populated with the value of `callback` after the first
 * time it’s called.
 *
 * @param  {object}   target   Target object to to register the property on
 * @param  {string}   name     Name of the property to register
 * @param  {Function} callback Callback handler that should return
 *                             the value of the property
 */
export function lazy(target, name, callback) {
	Object.defineProperty(target, name, {
		configurable: true,
		get: () => {
			const value = callback(target)

			Object.defineProperty(target, name, {
				value: value,
				writeable: false
			})

			return value
		}
	})
}
