const { Command, CommandOptions } = require(`../structures`)
const { log, getMemberObject, notify, createEmbed } = require('../utils/utils')

const { ROLE_WARNED } = require('../config/config.js').ROLES
const { AUTH_MOD } = require('../config/config.js').AUTH
const { CHANNEL_MOD_LOGS } = require('../config/config.js').CHANNELS

class Warn extends Command {
	constructor(client) {
		const commandOptions = new CommandOptions({
			name: `warn`,
			cooldown: 1000,
			nOfParams: 2,
			description: `بتحذر ميمبر على حاجة عملها`,
			exampleUsage: `<user_mention> <reason>`,
			extraParams: true,
			optionalParams: 0,
			auth: {
				method: 'ROLE',
				required: AUTH_MOD
			}
		})
		super(client, commandOptions)
	}

	async _run({ member, message, channel, params }) {
		const [mention, ...reasonWords] = params
		const mentionRegex = /<@!(\d+)>/

		if (!mentionRegex.test(mention))
			return message.reply('لازم تعمل منشن للـ member')

		const id = mention.match(mentionRegex)[1]
		const reason = reasonWords.join(' ')
		const targetMember = getMemberObject(this.client, id)

		const embed = createEmbed({
			title: 'Warned User',
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
			if (this.isWarned(targetMember))
				return message.reply('الميمبر ده متحذر قبل كده')

			await targetMember.roles.add(ROLE_WARNED)
			notify(this.client, ``, embed, CHANNEL_MOD_LOGS)
		} catch (err) {
			log(this.client, err, 'error')
		}
	}

	isWarned(member) {
		return member.roles.cache.find(role => role.id === ROLE_WARNED)
	}
}

module.exports = Warn
