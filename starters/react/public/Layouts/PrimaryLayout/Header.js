import './Links'

export function Header() {
	const { Route } = ReactConductor

	return <header className="header">
		<div className="container header-container">
			<Route name="welcome.show" className="brand-logo header-logo">Grind</Route>

			<nav className="header-links">
				<Links className="header-link" />
			</nav>
		</div>
	</header>
}
