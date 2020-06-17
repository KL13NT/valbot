const { Command, CommandOptions } = require(`../structures`)
const { log, getMemberObject, notify, createEmbed } = require('../utils/utils')

class Ban extends Command {
	constructor(client) {
		const commandOptions = new CommandOptions({
			name: `ban`,
			cooldown: 1000,
			nOfParams: 2,
			requiredRole: 'mod',
			description: `بتطرد ميمبر من السيرفر, مبيقدرش يخش تاني`,
			exampleUsage: `<user_mention> <reason>`,
			extraParams: true,
			optionalParams: 0,
			auth: {
				method: 'PERMISSION',
				required: 'BAN_MEMBERS'
			}
		})
		super(client, commandOptions)
	}

	async _run({ member, message, channel, params }) {
		const { CHANNEL_MOD_LOGS } = this.client.config.CHANNELS
		const [mention, ...reasonWords] = params
		const mentionRegex = /<@!(\d+)>/

		if (!mentionRegex.test(mention))
			return message.reply('لازم تعمل منشن للـ member')

		const id = mention.match(mentionRegex)[1]
		const reason = reasonWords.join(' ')
		const targetMember = getMemberObject(this.client, id)

		const embed = createEmbed({
			title: 'Banned User',
			fields: [
				{ name: '**User**', value: `${mention} | ${id}` },
				{ name: '**Moderator**', value: `<@${member.id}> | ${id}` },
				{ name: '**Location**', value: `<#${channel.id}>`, inline: true },
				{
					name: '**Date / Time**',
					value: `${new Date().toUTCString()}`,
					inline: true
				},
				{ name: '**Reason**', value: reason }
			]
		})

		try {
			await targetMember.ban({
				reason: `${member.user.tag} - ${reason}`
			})

			notify(this.client, ``, embed, CHANNEL_MOD_LOGS)
		} catch (err) {
			log(this.client, err, 'error')
		}
	}
}

module.exports = Ban
