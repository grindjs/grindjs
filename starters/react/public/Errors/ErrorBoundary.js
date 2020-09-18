import '../Layouts/ErrorLayout'

import './GenericErrorHandler'
import './NotFoundErrorHandler'

import './Errors.scss'

const errorHandlers = {
	404: NotFoundErrorHandler,
}

export class ErrorBoundary extends React.Component {
	state = {
		error: null,
		info: null,
	}

	componentDidMount() {
		window.addEventListener('popstate', this.clearState, false)
	}

	componentWillUnmount() {
		window.removeEventListener('popstate', this.clearState)
	}

	componentDidCatch(error, info) {
		this.setState({ error, info })
	}

	clearState = () => {
		this.setState({ error: null, info: null })
	}

	render() {
		const { error, info } = this.state

		if (error.isNil) {
			return this.props.children
		}

		const ErrorHandler = errorHandlers[error.code || 0] || GenericErrorHandler

		return (
			<ErrorLayout>
				<ErrorHandler error={error} info={info} />
			</ErrorLayout>
		)
	}
}
