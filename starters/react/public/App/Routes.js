import '../Layouts/PrimaryLayout'

import '../Containers/Welcome'

export function Routes(routes) {
	routes.layout('', routes => {
		routes.add('', Welcome).as('welcome.show')
	}).component(PrimaryLayout)

	routes.add('*', () => {
		const error = new Error('Not Found')
		error.code = 404
		throw error
	})
}
