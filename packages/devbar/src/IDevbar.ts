import { Application } from '@grindjs/framework'
import { Request, Response } from 'express'

import { Container } from './Containers/Container'

export interface IDevbar {
	/**
	 * Whether or not the instance is enabled
	 */
	isEnabled: boolean

	/**
	 * Get the current devbar from the Zone
	 */
	current: IDevbar | null

	/**
	 * Whether or not the instance is mocked
	 */
	isMock?: boolean

	/**
	 * Containers are groups of messages that appear
	 * on the devbar
	 */
	containers: Record<string, Container>

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
	time(label: string, message?: string): void

	/**
	 * Stops a timer that was previously started by calling devbar.time()
	 * and adds the entry to the devbar’s timeline.
	 *
	 * @param  string label Unique label originally passed to devbar.time()
	 */
	timeEnd(label: string): void

	/**
	 * Adds a context item
	 *
	 * @param string value
	 */
	addContext(value: string): void

	/**
	 * Push a message onto a container
	 * @param string container Container label to appear on the devbar
	 * @param string  message   Message string or object containing a message
	 *                         property and a start or duration property
	 */
	add(container: string, message: string): void

	/**
	 * Registers a collector to be started with the devbar
	 */
	register(collector: (app: Application, devbar: IDevbar) => void): void

	/**
	 * Starts the devbar middleware
	 *
	 * @param  {Function} next
	 */
	start(next: (error?: any) => void): void

	/**
	 * Clone the instance to be used within a
	 * request cycle.
	 *
	 * @param object req
	 * @param object res
	 *
	 * @return IDevbar
	 */
	clone(req: Request, res: Response): IDevbar

	emit(event: string, ...args: any[]): void
	on(event: string, handler: (...args: any[]) => void): void
}
