export function MasterLayout({ contentBefore, contentAfter, children } = { }) {
	return <div className="container">
		{contentBefore}
		<div className="content">{children}</div>
		{contentAfter}
	</div>
}
