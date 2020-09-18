export function Body() {
	return (
		<div className="welcome-body">
			<h1 className="welcome-header">Welcome to Grind</h1>
			<p className="welcome-lead">
				Grind is an opinionated Node web framework that utilizes popular packages in an easy
				to use framework to provide a solid foundation for you to build your apps on,
				without reinventing the wheel.
			</p>

			<div className="welcome-buttons">
				<a href="https://grind.rocks/docs" className="btn btn-info welcome-button">
					View Documentation<span className="btn-icon btn-icon-chevron-right"></span>
				</a>
				<a href="https://github.com/grindjs" className="btn welcome-button">
					Explore the Code<span className="btn-icon btn-icon-chevron-right"></span>
				</a>
			</div>
		</div>
	)
}
