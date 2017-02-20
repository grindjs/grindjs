export function OtherRoutes(routes) {
	routes.get('load', (req, res) => res.send({ loaded: true }))
}
