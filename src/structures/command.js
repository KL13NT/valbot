const CommandContext = require('./CommandContext')
const CommandOptions = require('./CommandOptions')
const {
	GENERIC_SOMETHING_WENT_WRONG,
	GENERIC_CONTROLLED_COMMAND_CANCEL,
	ERROR_GENERIC_SOMETHING_WENT_WRONG,
	ERROR_COMMAND_NOT_ALLOWED
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
	run (message){
		const { channel, content } = message
		const params = content.split(/\s+/).slice(2)


		console.log(params)

		channel.startTyping()

		if(this.enforceParams(params, message) === true){
			const context = new CommandContext(this, message)
			context.params = params

			if(this.isAllowed(context)) this.enforceCooldown(context)
			else return message.reply(ERROR_COMMAND_NOT_ALLOWED)
		}

		channel.stopTyping()
	}


	/**
	 * Responsible for running commands. Should be overridden in each command.
	 * @public
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

		const { name, requiredAuthLevel, nOfParams, exampleUsage, description } = this.options

		message.reply(`
			معلومات عن ${name}:
			الاستعمال:\n\`${exampleUsage}\`
			الوظيفة:\n\`${description}\`
			بتاخد كام باراميتير\n\`${nOfParams}\`
			اقل مستوى أمني مسموح بيه \n\`${requiredAuthLevel}\`
		`)

	}
}

module.exports = Command