import './Wrapper'
import './Routes'

const { Router } = ReactConductor

export function Bootstrap(app) {
	app.router = new Router

	Routes(app.router)

	window.onload = () => {
		ReactDOM.render(
			<Wrapper />,
			document.getElementById('root')
		)
	}
}
