export function GenericErrorHandler({ title = 'Uh oh, something went wrong!', error = null } = { }) {
	return <div className="error-wrapper">
		<div className="error">
			<h1 className="error-heading">{title}</h1>
			{App.state.debug && !error.isNil ? <p className="error-message">{error.message}</p> : null}
		</div>
	</div>
}
