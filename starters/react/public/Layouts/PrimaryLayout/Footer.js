import './Links'

export function Footer() {
	return <footer className="footer">
		<div className="container footer-container">
			<a href="" className="brand-logo footer-logo">Grind</a>

			<span className="footer-content">
				<nav className="footer-links">
					<Links className="footer-link" />
				</nav>

				<span className="footer-text">Grind was created by <a href="https://github.com/shnhrrsn" target="_blank" rel="noopener noreferrer">Shaun Harrison</a> and is made available under the MIT license.</span>
			</span>
		</div>
	</footer>
}
