const CommandContext = require('./CommandContext')
const CommandOptions = require('./CommandOptions')

const AUTH_ROLES = require('../config/auth-roles.json')
const {
	GENERIC_SOMETHING_WENT_WRONG,
	GENERIC_CONTROLLED_COMMAND_CANCEL,
	ERROR_GENERIC_SOMETHING_WENT_WRONG,
	ERROR_COMMAND_NOT_ALLOWED,
	ERROR_COMMAND_NOT_READY,
	ERROR_INSUFFICIENT_PARAMS_PASSED
} = require('../config/events.json')

const { generateEvent, log, getRoleObject } = require('../utils/utils')

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
	 * Determines whether user is allowed to use this command
	 * @param {CommandContext} context message context
	 * @private
	 */
	run (message){
		if(!this.client.ready) return message.reply('مش جاهز لسه')

		message.content = message.content.replace(/\s+/g, ' ')

		const split = message.content.split(' ')
		const params = split.slice(2)

		if(this.enforceParams(params, message) === true){
			const context = new CommandContext(this, message, this.options)
			context.params = params

			if(this.isAllowed(context)) this.enforceCooldown(context)
			else return message.reply(ERROR_COMMAND_NOT_ALLOWED)
		}
	}

	/**
	 * Checks whether member has sufficient auth
	 * @param {CommandContext} context message context
	 * @private
	 */
	isAllowed ({ member }){
		return member.roles.cache.some(
			(role) => {
				if(role.id === AUTH_ROLES[this.options.requiredRole])
					return true
				else {
					const values = Object.values(AUTH_ROLES)
					const indexOfRole = values.indexOf(role.id)
					const indexOfRequiredRole = values.indexOf(AUTH_ROLES[this.options.requiredRole])

					if(indexOfRole > -1 && indexOfRole <= indexOfRequiredRole) return true
				}
			}
		)
	}

	enforceCooldown (context){
		const { cooldown } = this.options

		if(this.isReady)
			this
				._run(context)
				.catch(err => {
					context.message.reply(GENERIC_SOMETHING_WENT_WRONG)
					log(this.client, err.message, 'error')
				})
		else context.message.reply(ERROR_COMMAND_NOT_READY)

		if(cooldown !== 0){
			this.isReady = false

			this.cooldownTimer = setTimeout(() => {
				this.isReady = true
			}, cooldown)
		}
	}

	enforceParams (params, message){
		const { nOfParams, extraParams, optionalParams } = this.options

		if(params[0] === 'help') return this.help(message)
		else if((params.length < nOfParams - optionalParams) || (params.length > nOfParams && !extraParams))
			return message.reply(
				generateEvent(
					this.client,
					ERROR_INSUFFICIENT_PARAMS_PASSED,
					{
						_PREFIX: this.client.prefix,
						COMMAND_NAME: this.options.name
					}
				)
			)
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
		const { name, requiredRole, nOfParams, exampleUsage, description } = this.options

		const role = getRoleObject(this.client, AUTH_ROLES[requiredRole])

		message.reply(`
			معلومات عن ${name}:
			الاستعمال:\n\`${exampleUsage}\`
			الوظيفة:\n\`${description}\`
			بتاخد كام باراميتير\n\`${nOfParams}\`
			اقل role مسموح بيه \n\`${role.name}\`
		`)

	}
}


module.exports = Command