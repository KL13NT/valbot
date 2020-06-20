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

const { log } = require('../utils/utils')
const { createEventMessage } = require('../utils/EventUtils')
const { getRoleObject } = require('../utils/DiscordObjectUtils')
const { createEmbed } = require('../utils/EmbedUtils')

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

		if (this.options.auth.devOnly) return this.isDevCommand(context)
		else return this.isAllowedRoles(context)
	}

	isDevCommand({ member }) {
		return member.roles.cache.has(process.env.ROLE_DEVELOPER)
	}

	isAllowedRoles({ member }) {
		const { required } = this.options.auth

		const AUTH_ROLES = this.client.config.AUTH
		const allRoles = Object.values(AUTH_ROLES)

		const requiredRole = AUTH_ROLES[required]
		const indexOfRequiredRole = allRoles.indexOf(requiredRole)

		return member.roles.cache.some(role => {
			const indexOfMemberRole = allRoles.indexOf(role.id)

			if (
				role.id === requiredRole ||
				(indexOfMemberRole > -1 && indexOfMemberRole <= indexOfRequiredRole)
			)
				return true
		})
	}

	// isAllowedPermissions({ member }) {
	// 	console.log(this.options)
	// 	return member.hasPermission(this.options.auth.required)
	// }

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
				createEventMessage(ERROR_INSUFFICIENT_PARAMS_PASSED, [
					{
						name: '_PREFIX',
						value: this.client.prefix
					},
					{
						name: 'COMMAND_NAME',
						value: this.options.name
					}
				])
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
		const { member } = message
		const {
			name,
			nOfParams,
			exampleUsage,
			description,
			auth,
			category
		} = this.options
		const { required, devOnly } = auth
		const { AUTH } = this.client.config

		const title = `**معلومات عن ${name}**\n`
		const fields = [
			{
				name: '**الاستعمال**',
				value: `\`${this.client.prefix} ${this.options.name} ${exampleUsage}\``
			},
			{
				name: '**الوصف/الوظيفة**',
				value: `${description}`
			},
			{
				name: '**عدد الباراميترز**',
				value: `${nOfParams}`
			},
			{
				name: '**اقل role مسموح بيه**',
				value: getRoleObject(
					this.client,
					devOnly ? process.env.ROLE_DEVELOPER : AUTH[required]
				).name
			},
			{
				name: '**الفئة**',
				value: `${category}`
			}
		]

		const embed = createEmbed({ title, fields })
		member.createDM().then(dm => {
			dm.send(embed)
			message.reply('بعتلك رسالة جادة جداً').then(sent => {
				setTimeout(() => {
					sent.delete()
				}, 5 * 1000)
			})
		})
	}
}

module.exports = Command
