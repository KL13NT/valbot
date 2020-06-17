const { Command, CommandOptions } = require(`../structures`)
const { mute, unmute, isMuted } = require('../utils/ModerationUtils')

class Mute extends Command {
	constructor(client) {
		const commandOptions = new CommandOptions({
			name: `mute`,
			cooldown: 1000,
			nOfParams: 2,
			description: `بتمنع الشخص انه يتكلم فويس او تيكست لمدة 5 دقايق`,
			exampleUsage: `<user_mention> <reason>`,
			extraParams: true,
			optionalParams: 0,
			auth: {
				method: 'ROLE',
				required: 'AUTH_MOD'
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

		if (isMuted(this.client, id)) return message.reply('معمولهم mute اصلاً')

		mute(this.client, {
			member: id,
			moderator: member.id,
			channel: channel.id,
			reason
		})
	}
}

module.exports = Mute
