
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
	 * @param {number} authLevel Permissions requires for the command
	 * @param {number} nOfParams Numbers of parameters required for the command
	 */
	constructor (name, cooldown = 0, authLevel, nOfParams = 2){
		this.name = name
		this.cooldown = cooldown
		this.authLevel = authLevel
		this.nOfParams = nOfParams
	}

}


module.exports = CommandOptions