import { Devbar } from '../Devbar'
import { Time } from '../Support/Time'
import { Container } from './Container'

export type Message = {
	message: string
	duration?: number | [number, number]
	start?: [number, number]
	durationInMs?: number
}

export class MessagesContainer extends Container {
	messages: (string | Message)[] = []

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
	add(message: string | Message) {
		if (typeof message === 'object') {
			if (typeof message.duration !== 'number' && message.start) {
				message.duration = Time.get(message.start)
			}

			if (Array.isArray(message.duration)) {
				message.duration = Time.flatten(message.duration)
			}

			message.durationInMs = Time.toMillis(message.duration as number)
		}

		this.messages.push(message)
	}

	/**
	 * @inheritdoc
	 */
	render(devbar: Devbar) {
		return devbar.renderView('containers/messages.stone', { messages: this.messages })
	}
}
