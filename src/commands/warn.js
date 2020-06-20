const { Command, CommandOptions } = require(`../structures`)
const { warn, isWarned } = require('../utils/ModerationUtils')
const { log } = require('../utils/utils')

class Warn extends Command {
	constructor(client) {
		const commandOptions = new CommandOptions({
			name: `warn`,
			category: 'Moderation',
			cooldown: 1000,
			nOfParams: 2,
			description: `بتحذر ميمبر على حاجة عملها`,
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

		try {
			if (isWarned(this.client, id))
				return message.reply('الميمبر ده متحذر قبل كده')

			warn(this.client, {
				member: id,
				moderator: member.id,
				channel: channel.id,
				reason
			})
		} catch (err) {
			log(this.client, err, 'error')
		}
	}
}

module.exports = Warn
