const { Command, CommandOptions } = require(`../structures`)
const { ban } = require('../utils/ModerationUtils')

class Ban extends Command {
	constructor(client) {
		const commandOptions = new CommandOptions({
			name: `ban`,
			cooldown: 1000,
			nOfParams: 2,
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
		const [mention, ...reasonWords] = params
		const mentionRegex = /<@!(\d+)>/

		if (!mentionRegex.test(mention))
			return message.reply('لازم تعمل منشن للـ member')

		const id = mention.match(mentionRegex)[1]
		const reason = reasonWords.join(' ')

		ban(this.client, {
			member: id,
			moderator: member.id,
			channel: channel.id,
			reason
		})
	}
}

module.exports = Ban
