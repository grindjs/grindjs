import './Container'
import '../Support/Time'

export class MessagesContainer extends Container {

	messages = [ ]

	/**
	 * @inheritdoc
	 */
	get size() {
		return this.messages.length
	}

	/**
	 * Push a message onto a container
	 * @param mixed  message   Message string or object containing a message
	 *                         property and a start or duration property
	 */
	add(message) {
		if(typeof message === 'object') {
			if(message.duration.isNil && !message.start.isNil) {
				message.duration = Time.get(message.start)
			}

			message.duration = Time.flatten(message.duration)
			message.durationInMs = Time.toMillis(message.duration)
		}

		this.messages.push(message)
	}

	/**
	 * @inheritdoc
	 */
	render(devbar) {
		return devbar.renderView('containers/messages.stone', { messages: this.messages })
	}

}
