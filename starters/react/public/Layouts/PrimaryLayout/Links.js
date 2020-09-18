export function Links({ className }) {
	return (
		<>
			<a href="https://grind.rocks/docs" className={className}>
				Documentation
			</a>
			<a href="https://github.com/grindjs" className={className}>
				GitHub
			</a>
			<a
				href="https://twitter.com/grindjs"
				className={className}
				target="_blank"
				rel="noopener noreferrer"
			>
				Twitter
			</a>
			<a
				href="https://grind.chat/"
				className={className}
				target="_blank"
				rel="noopener noreferrer"
			>
				Slack
			</a>
		</>
	)
}
