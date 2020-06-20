const { Command } = require('../structures')
const { CommandOptions } = require('../structures')
const { log, notify } = require('../utils/utils')
const {
	getRoleObject,
	getMemberObject
} = require('../utils/DiscordObjectUtils')
const { createRoleEmbed } = require('../utils/EmbedUtils')

class RoleGive extends Command {
	/**
	 * Constructs help command
	 * @param {ValClient} client
	 */
	constructor(client) {
		const options = new CommandOptions({
			name: `rolegive`,
			category: 'Moderation',
			cooldown: 1000,
			nOfParams: 2,
			description: `بتدي لميمبر روول معين`,
			exampleUsage: `@Sovereign#4984 <role_name|role_id>`,
			extraParams: false,
			auth: {
				method: 'ROLE',
				required: 'AUTH_MOD'
			}
		})

		super(client, options)
	}

	async _run(context) {
		const { CHANNEL_MOD_LOGS } = this.client.config.CHANNELS
		const { message, params, member, channel } = context
		const roleNameRegex = /\S+/i
		const roleIDRegex = /\d+/i
		const mentionRegex = /<@!(\d+)>/

		if (!roleNameRegex.test(params[1]) && !roleID.test(params[1]))
			return message.reply('لازم تكتب اسم او الاي دي بتاع الروول')

		if (!mentionRegex.test(params[0]))
			return message.reply('لازم تعمل منشن للميمبر اللي عايز تديله الروول ده')

		const roleID =
			params[1].match(roleNameRegex)[0] || params[1].match(roleIDRegex)[0]
		const targetMemberID = params[0].match(mentionRegex)[1]

		const role = getRoleObject(this.client, roleID)
		const targetMember = getMemberObject(this.client, targetMemberID)

		const embed = createRoleEmbed({
			title: 'Member Role Added',
			member: targetMemberID,
			moderator: member.id,
			channel: channel.id,
			role: role.id
		})

		targetMember.roles
			.add(role)
			.then(() => {
				notify(this.client, `<@${targetMemberID}>`, embed, CHANNEL_MOD_LOGS)
				message.reply(`اديت الميمبر ده روول ${role.name}`)
			})
			.catch(err => {
				log(this.client, err, 'error')
			})
	}
}

module.exports = RoleGive
