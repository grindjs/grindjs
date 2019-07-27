import './MasterLayout'

const { Switch } = ReactConductor

export function RoutingLayout({ routes, contentBefore, contentAfter, ...props } = { }) {
	return <MasterLayout contentBefore={contentBefore} contentAfte={contentAfter}>
		<Switch routes={routes} {...props} />
	</MasterLayout>
}
