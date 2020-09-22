const log = require('./log')
const { execFileSync } = require('child_process')

module.exports = function git(...args) {
	log.debug(`+ git ${args.join(' ')}`)
	execFileSync('git', args, { stdio: 'inherit' })
}
