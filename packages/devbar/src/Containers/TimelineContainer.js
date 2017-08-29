import './Container'
import '../Support/Time'

export class TimelineContainer extends Container {

	/**
	 * Timeline object to track time/timeEnd
	 */
	timeline = { }

	/**
	 * @inheritdoc
	 */
	get hasPanel() {
		return Object.keys(this.timeline).length > 0
	}

	/**
	 * Starts a timer that can be used to compute the duration of
	 * an operation. Timers are identified by a unique label. Use
	 * the same label when calling devbar.timeEnd() to stop the
	 * timer and the elapsed time in milliseconds to devbar’s
	 * timeline.
	 *
	 * @param  string label Unique label to identify this operation
	 */
	time(label) {
		this.timeline[label] = {
			start: process.hrtime()
		}
	}

	/**
	 * Stops a timer that was previously started by calling devbar.time()
	 * and adds the entry to the devbar’s timeline.
	 *
	 * @param  string label Unique label originally passed to devbar.time()
	 */
	timeEnd(name) {
		const timing = this.timeline[name]

		if(timing === void 0 || timing.duration !== void 0) {
			return
		}

		timing.duration = process.hrtime(timing.start)
	}

	/**
	 * @inheritdoc
	 */
	render(devbar, context) {
		const timeline = Object.entries(this.timeline).map(([ label, item ]) => {
			if(!item.duration) {
				return null
			}

			item.duration = Time.flatten(item.duration)

			return {
				label: label,
				start: Time.flatten(item.start),
				duration: item.duration,
				durationInMs: Time.toMillis(item.duration)
			}
		}).filter(item => item !== null)

		return devbar.renderView('containers/timeline.stone', { ...context, timeline })
	}

}
