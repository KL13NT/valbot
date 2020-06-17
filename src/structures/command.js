const Discord = require('discord.js')

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

const { generateEvent, log, getRoleObject } = require('../utils/utils')

class Command {
	/**
	 *
	 * @param {ValClient} client
	 * @param {CommandOptions} options
	 */
	constructor(client, options) {
		if (!(options instanceof CommandOptions))
			throw Error('Command options invalid')

		this.client = client
		this.options = options
		this.isReady = true
	}

	/**
	 * Determines whether user is allowed to use this command
	 * @param {CommandContext} context message context
	 * @private
	 */
	run(message) {
		if (!this.client.ready && this.options.name !== 'setup')
			return message.reply(
				`مش جاهز لسه او البوت مش معمله setup. شغلوا \`${this.client.prefix} setup\``
			)

		message.content = message.content.replace(/\s+/g, ' ')

		const split = message.content.split(' ')
		const params = split.slice(2)

		if (this.enforceParams(params, message) === true) {
			const context = new CommandContext(this, message, this.options)
			context.params = params

			if (this.isAllowed(context)) this.enforceCooldown(context)
			else return message.reply(ERROR_COMMAND_NOT_ALLOWED)
		}
	}

	/**
	 * Checks whether member has sufficient auth
	 * @param {CommandContext} context message context
	 * @private
	 */
	isAllowed(context) {
		if (context.member.hasPermission('ADMINISTRATOR')) return true

		if (this.options.auth.method === 'ROLE') {
			if (this.options.auth.role === 'AUTH_DEV')
				return this.isDevCommand(context)
			else return this.isAllowedRoles(context)
		} else return this.isAllowedPermissions(context)
	}

	isDevCommand(context) {
		const { member } = context

		if (member.roles.cache.has(process.env.ROLE_DEVELOPER)) {
			return true
		}
	}

	isAllowedRoles({ member }) {
		const { required } = this.options.auth
		const AUTH_ROLES = this.client.config.AUTH
		const allRoles = Object.values(AUTH_ROLES)

		return member.roles.cache.some(role => {
			const indexOfMemberRole = allRoles.indexOf(role.id)
			const indexOfRequiredRole = allRoles.indexOf(required)

			if (
				role.id === required ||
				(indexOfMemberRole > -1 && indexOfMemberRole <= indexOfRequiredRole)
			)
				return true
		})
	}

	isAllowedPermissions({ member }) {
		return member.permissions.has(this.options.auth.required)
	}

	enforceCooldown(context) {
		const { cooldown } = this.options

		if (this.isReady)
			this._run(context).catch(err => {
				context.message.reply(GENERIC_SOMETHING_WENT_WRONG)
				log(this.client, err, 'error')
			})
		else context.message.reply(ERROR_COMMAND_NOT_READY)

		if (cooldown !== 0) {
			this.isReady = false

			this.cooldownTimer = setTimeout(() => {
				this.isReady = true
			}, cooldown)
		}
	}

	enforceParams(params, message) {
		const { nOfParams, extraParams, optionalParams } = this.options

		if (params[0] === 'help') return this.help(message)
		else if (
			params.length < nOfParams - optionalParams ||
			(params.length > nOfParams && !extraParams)
		)
			return message.reply(
				generateEvent(this.client, ERROR_INSUFFICIENT_PARAMS_PASSED, {
					_PREFIX: this.client.prefix,
					COMMAND_NAME: this.options.name
				})
			)
		else return true
	}

	/**
	 * Responsible for running commands. Should be overridden in each command.
	 * @public
	 * @param {CommandContext} context
	 */
	async _run(context) {
		// return true;
	}

	/**
	 * cancels an ongoing command
	 */
	stop(context, isGraceful, error) {
		if (!isGraceful)
			context.message.reply(error || ERROR_GENERIC_SOMETHING_WENT_WRONG)
		else context.message.reply(GENERIC_CONTROLLED_COMMAND_CANCEL)

		this.isReady = true

		clearTimeout(this.cooldownTimer)
	}

	/**
	 * Replies to message with proper help
	 * @param {GuildMessage} message message to reply to
	 */
	help(message) {
		const { name, nOfParams, exampleUsage, description, auth } = this.options

		const requiredRolePermission = this.getCommandRequired(auth)

		const replies = [
			`**معلومات عن ${name}**\n`,
			`**الاستعمال**\n\`${this.client.prefix} ${this.options.name} ${exampleUsage}\``,
			`**الوظيفة**\n\`${description}\``,
			`**بتاخد كام باراميتير**\n\`${nOfParams}\``,
			`**اقل permission او role مسموح بيه** \n\`${requiredRolePermission}\``
		]

		message.reply(replies.join('\n'))
	}

	getCommandRequired({ method, required }) {
		const { AUTH } = this.client.config

		if (method === 'ROLE') {
			if (required === 'AUTH_DEV')
				return getRoleObject(this.client, process.env.ROLE_DEVELOPER).name
			else return getRoleObject(this.client, AUTH[required]).name
		} else return required
	}
}

module.exports = Command
