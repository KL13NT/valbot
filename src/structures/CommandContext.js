const { ERROR_CONTEXT_PARAMS_MALFORMED } = require('../config/events.json')
/**
 * @typedef {object} AuthLevels
 * @property {number} 0 Developers
 * @property {number} 1 High Table [admin]
 * @property {number} 2 Protectors [mod]
 * @property {number} 3 Verified members role
 * @property {number} 4 Everyone
 */

/**
 * @prop {ValClient} client The current ValClient instance
 * @prop {GuildMessage} message Message object
 * @prop {AuthLevel} userAuthLevel Authorization level of user
 * @prop {array} params Params the command's _run is expecting
 */

class CommandContext {
	/**
	 * @param {ValClient} client The current ValClient instance
	 * @param {GuildMessage} message Message object
	 */
	constructor(client, message) {
		if (client && message.author && message.member) {
			this.client = client
			this.message = message
			this.author = message.author
			this.member = message.member
			this.channel = message.channel
			this.guild = message.guild
			this.params = []
			this.message.content = this.message.content.replace(/\s+/g, ' ')
		} else throw Error(ERROR_CONTEXT_PARAMS_MALFORMED)
	}
}

module.exports = CommandContext
