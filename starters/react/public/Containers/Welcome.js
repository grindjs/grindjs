import './Welcome/Body'
import './Welcome/Code'
import './Welcome/Welcome.scss'

export function Welcome() {
	return (
		<div className="welcome">
			<Body />
			<Code />
		</div>
	)
}
