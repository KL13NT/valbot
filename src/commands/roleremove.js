const { Command } = require('../structures')
const { CommandOptions } = require('../structures')
const {
	log,
	getMemberObject,
	getRoleObject,
	notify
} = require('../utils/utils')
const { createRoleEmbed } = require('../utils/EmbedUtils')

class RoleRemove extends Command {
	/**
	 * Constructs help command
	 * @param {ValClient} client
	 */
	constructor(client) {
		const options = new CommandOptions({
			name: `roleremove`,
			category: 'Moderation',
			cooldown: 1000,
			nOfParams: 2,
			description: `بتشيل روول من ميمبر`,
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
		const { message, params, channel, member } = context
		const roleNameRegex = /\w+/i
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
			title: 'Member Role Removed',
			member: targetMemberID,
			moderator: member.id,
			channel: channel.id,
			role: role.id
		})

		targetMember.roles
			.remove(role)
			.then(() => {
				notify(this.client, '', embed)
				message.reply(`شيلت روول ${role.name} من الميمبر ده`)
			})
			.catch(err => {
				log(this.client, err, 'error')
			})
	}
}

module.exports = RoleRemove
