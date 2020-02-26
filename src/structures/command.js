const CommandContext = require('./CommandContext')
const CommandOptions = require('./CommandOptions')
const { getRoleObject } = require('../utils/utils')
const { GENERIC_SOMETHING_WENT_WRONG, COMMAND_NOT_ALLOWED } = require('../utils/Errors')




/**
 * Command Structure
 * @param {ValClient} client Valarium-bot client
 * @param {CommandOptions} options Command initialisation options
 * @property {boolean} ready Whether command can be used
 */

class Command{
	/**
	 *
	 * @param {ValClient} client
	 * @param {*} options
	 */
	constructor (client, options) {

		if(!(options instanceof CommandOptions)) throw Error('Command options invalid')

		this.client = client
		this.options = options
		this.ready = true

	}

	/**
	 * Checks whether member has sufficient auth
	 * @param {CommandContext} context message context
	 * @private
	 */
	isAllowed ({ authLevel }){
		if(authLevel <= this.options.requiredAuthLevel) return true
	}

	/**
	 * Enforces command code to create context correctly
	 * @param {CommandContext} context message context
	 * @private
	 */
	checkContext (context){
		return context instanceof CommandContext
	}

	/**
	 * Determines whether user is allowed to use this command
	 * @param {CommandContext} context message context
	 * @private
	 */
	run (context){
		const { cooldown } = this.options

		if(this.checkContext(context) && this.isAllowed(context)) {
			if(this.ready) this._run(context).catch(() => context.message.reply(GENERIC_SOMETHING_WENT_WRONG))

			if(cooldown !== 0){
				this.ready = false

				setTimeout(() => {
					this.ready = true
				}, cooldown)
			}
		}
		else {
			context.message.reply(COMMAND_NOT_ALLOWED)
		}
	}

	/**
	 * Responsible for running commands. Should be overridden in each command.
	 * @param {CommandContext} context
	 */
	async _run (context) {
		// return true;
	}


	/**
	 * Replies to message with proper help
	 * @param {GuildMessage} message message to reply to
	 */
	help (message){

		const { nOfParams, exampleUsage, description } = this.options

		message.reply(`
			معلومات عن ${this.options.name}:
			الاستعمال:\n\`${exampleUsage}\`
			الوظيفة:\n\`${description}\`
			بتاخد كام باراميتير\n\`${nOfParams}\`
		`)

	}
}

module.exports = Command