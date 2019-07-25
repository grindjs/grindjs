const { Switch } = ReactConductor

export function MasterLayout({ routes, contentBefore, contentAfter, ...props } = { }) {
	return <div className="container">
		{contentBefore}
		<div className="content">
			<Switch routes={routes} {...props} />
		</div>
		{contentAfter}
	</div>
}
