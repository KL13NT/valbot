/**
 * @typedef {object} CommandOptions
 * @description Command Configuration Options
 * @property {string} name Command name
 * @property {number} [cooldown = 0] Time between calls to the same command, default 0 (in ms)
 * @property {number} nOfParams Numbers of parameters required for the command
 * @property {number} requiredAuthLevel Required Member Permissions
 * @property {string} [description = 'Unavailable'] Description Description of the command
 * @property {string} [exampleUsage = 'Unavailable'] How the command could be used in chat
 * @method {boolean} verifySchema
 */

class CommandOptions {
	/**
	 *
	 * @param {object} options
	 */
	constructor(options) {
		Object.assign(this, options)
	}

	/**
	 * Verifies the passed options object matches schema
	 * @returns boolean
	 */
	verifySchema() {
		const schema = require('../config/command-options-schema.json')

		for (const key in this) {
			if (key === 'extraParams' || key === 'optionalParams') continue
			else if (typeof this[key] !== schema[key]) return false
		}

		return true
	}
}

module.exports = CommandOptions
