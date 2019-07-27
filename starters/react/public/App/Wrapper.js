import './App.scss'

export function Wrapper({ ...args } = { }) {
	const { RouteHandler, Switch } = ReactConductor

	return <RouteHandler router={App.router}>
		<div className="wrapper">
			<Switch routes={App.router.routes} {...args} />
		</div>
	</RouteHandler>
}
