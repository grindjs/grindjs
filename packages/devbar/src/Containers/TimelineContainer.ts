import { Devbar } from '../Devbar'
import { Time } from '../Support/Time'
import { Container } from './Container'

export class TimelineContainer extends Container {
	/**
	 * Timeline object to track time/timeEnd
	 */
	timeline: Record<
		string,
		{
			message?: string
			start: [number, number]
			duration?: [number, number]
		}
	> = {}

	/**
	 * @inheritdoc
	 */
	get size() {
		return Object.keys(this.timeline).length
	}

	/**
	 * Starts a timer that can be used to compute the duration of
	 * an operation. Timers are identified by a unique label. Use
	 * the same label when calling devbar.timeEnd() to stop the
	 * timer and the elapsed time in milliseconds to devbar’s
	 * timeline.
	 *
	 * @param  string label   Unique label to identify this operation
	 * @param  string message Optional message to display in panel instead of label
	 */
	time(label: string, message?: string) {
		this.timeline[label] = {
			start: process.hrtime(),
			message: message,
		}
	}

	/**
	 * Stops a timer that was previously started by calling devbar.time()
	 * and adds the entry to the devbar’s timeline.
	 *
	 * @param  string label Unique label originally passed to devbar.time()
	 */
	timeEnd(label: string) {
		const timing = this.timeline[label]

		if (timing === void 0 || timing.duration !== void 0) {
			return
		}

		timing.duration = process.hrtime(timing.start)
	}

	/**
	 * @inheritdoc
	 */
	render(devbar: Devbar, context: Record<string, any>) {
		const timeline = Object.entries(this.timeline)
			.map(([label, item]) => {
				if (!item.duration) {
					return undefined
				}

				const duration = Time.flatten(item.duration)

				return {
					label: item.message || label,
					start: Time.flatten(item.start),
					duration: duration,
					durationInMs: Time.toMillis(duration),
				}
			})
			.filter(item => item !== undefined)

		return devbar.renderView('containers/timeline.stone', { ...context, timeline })
	}
}
