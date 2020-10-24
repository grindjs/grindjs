import { Paths as BasePaths } from '@grindjs/framework'

export interface Paths extends BasePaths {
	project(...args: string[]): string
}
