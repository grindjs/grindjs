import '../Layouts/PrimaryLayout'

import '../Containers/Welcome'
import '../Containers/NotFound'

export function Routes(routes) {
	routes.layout('', routes => {
		routes.add('', Welcome).as('welcome.show')
	}).component(PrimaryLayout)

	routes.add('*', NotFound)
}
