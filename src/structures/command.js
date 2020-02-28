const CommandContext = require('./CommandContext')
const CommandOptions = require('./CommandOptions')
const {
	GENERIC_SOMETHING_WENT_WRONG,
	COMMAND_NOT_ALLOWED,
	GENERIC_CONTROLLED_COMMAND_CANCEL,
	ERROR_GENERIC_SOMETHING_WENT_WRONG
} = require('../config/events.json')



class Command{
	/**
	 *
	 * @param {ValClient} client
	 * @param {CommandOptions} options
	 */
	constructor (client, options) {

		if(!(options instanceof CommandOptions) || !options.verifySchema()) throw Error('Command options invalid')

		this.client = client
		this.options = options
		this.isReady = true

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
			if(this.isReady) this._run(context).catch(err => context.message.reply(GENERIC_SOMETHING_WENT_WRONG) && console.log(err))

			if(cooldown !== 0){
				this.isReady = false

				this.cooldownTimer = setTimeout(() => {
					this.isReady = true
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
	 * cancels an ongoing command
	 */
	stop (context, isGraceful, error){
		if(!isGraceful) context.message.reply(error || ERROR_GENERIC_SOMETHING_WENT_WRONG)
		else context.message.reply(GENERIC_CONTROLLED_COMMAND_CANCEL)

		this.isReady = true

		clearTimeout(this.cooldownTimer)
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