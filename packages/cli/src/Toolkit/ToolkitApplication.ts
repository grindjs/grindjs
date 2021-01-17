import { Application } from '@grindjs/framework'

import { Paths } from './Paths'
import { StubGenerator } from './StubGenerator'

export interface ToolkitApplication extends Application {
	stubs: StubGenerator
	paths: Paths
}
