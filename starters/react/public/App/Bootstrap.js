import './Wrapper'
import './Routes'
import '../Errors/ErrorBoundary'

const { Router } = ReactConductor

export function Bootstrap(app) {
	app.router = new Router()
	app.state =
		JSON.parse((document.querySelector('meta[name="app:state"]') || {}).content || '{}') || {}

	Routes(app.router)

	window.onload = () => {
		ReactDOM.render(
			<ErrorBoundary>
				<Wrapper />
			</ErrorBoundary>,
			document.getElementById('root'),
		)
	}
}
