import './App.scss'
const { RouteHandler, Switch } = ReactConductor

/*
	state = {
		section: '404'
	}

	args = {
		navigation: {
			section: this.section
		}
	}
*/

export function Wrapper({ ...args } = { }) {
	return <RouteHandler router={App.router}>
		<div className="wrapper">
			<Switch routes={App.router.routes} {...args} />
		</div>
	</RouteHandler>
}
