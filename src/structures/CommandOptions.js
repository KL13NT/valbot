
/**
 * Command Configuration Options
 * @prop {string} name Command name
 * @prop {number} cooldown Time between calls to the same command, default 0 (in ms)
 * @prop {number} authLevel Permissions requires for the command
 */

class CommandOptions {
	/**
	 * Command Configuration Options
	 * @param {string} name Command name
	 * @param {number} [cooldown = 0] Time between calls to the same command, default 0 (in ms)
	 * @param {number} nOfParams Numbers of parameters required for the command
	 * @param {number} requiredAuthLevel Required Member Permissions
	 * @param {string} [description = 'Unavailable'] description Description of the command
	 * @param {string} [exampleUsage = 'Unavailable'] How the command could be used in chat
	 */
	constructor (name, cooldown = 0, nOfParams = 2, requiredAuthLevel = 4, description = `unavailable`, exampleUsage = `unavailable`){
		this.name = name
		this.cooldown = cooldown
		this.nOfParams = nOfParams
		this.requiredAuthLevel = requiredAuthLevel
		this.description = description
		this.exampleUsage = exampleUsage
	}

}


module.exports = CommandOptions