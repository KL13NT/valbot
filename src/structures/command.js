const CommandContext = require('./CommandContext')
const CommandOptions = require('./CommandOptions')
const {
	GENERIC_SOMETHING_WENT_WRONG,
	GENERIC_CONTROLLED_COMMAND_CANCEL,
	ERROR_GENERIC_SOMETHING_WENT_WRONG,
	ERROR_COMMAND_NOT_ALLOWED,
	ERROR_COMMAND_NOT_READY,
	ERROR_INSUFFICIENT_PARAMS_PASSED
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
	 * Determines whether user is allowed to use this command
	 * @param {CommandContext} context message context
	 * @private
	 */
	run (message){
		if(!this.client.isReady) return message.reply('Client not ready yet')
		
		message.content = message.content.replace(/\s+/g, ' ')

		const split = message.content.split(' ')
		const params = split.slice(2)

		if(this.enforceParams(params, message) === true){
			const context = new CommandContext(this, message)
			context.params = params

			if(this.isAllowed(context)) this.enforceCooldown(context)
			else return message.reply(ERROR_COMMAND_NOT_ALLOWED)
		}
	}


	enforceCooldown (context){
		const { cooldown } = this.options

		if(this.isReady) this._run(context).catch(err => context.message.reply(GENERIC_SOMETHING_WENT_WRONG) && console.log(err))
		else context.message.reply(ERROR_COMMAND_NOT_READY)

		if(cooldown !== 0){
			this.isReady = false

			this.cooldownTimer = setTimeout(() => {
				this.isReady = true
			}, cooldown)
		}
	}

	enforceParams (params, message){
		const { nOfParams, extraParams } = this.options

		if(params[0] === 'help') return this.help(message)
		else if((params.length < 1 && nOfParams >= 1) || (params.length > nOfParams && !extraParams)) return message.reply(ERROR_INSUFFICIENT_PARAMS_PASSED)
		else return true
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