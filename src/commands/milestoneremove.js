const { Command } = require('../structures')
const { CommandOptions } = require('../structures')
const {
	log,
	getMemberObject,
	getRoleObject,
	notify
} = require('../utils/utils')

class MilestoneRemove extends Command {
	/**
	 * Constructs help command
	 * @param {ValClient} client
	 */
	constructor(client) {
		const options = new CommandOptions({
			name: `milestoneremove`,
			cooldown: 1000,
			nOfParams: 1,
			description: `بتشيل مايلستوون معينة`,
			exampleUsage: `<level>`,
			extraParams: false,
			optionalParams: 0,
			auth: {
				method: 'ROLE',
				required: 'AUTH_ADMIN'
			}
		})

		super(client, options)
	}

	async _run(context) {
		const { message, member, params, channel } = context

		const levelRegex = /(\d+)/i

		const filter = m => m.author.id === member.id
		const awaitOptions = {
			time: 60 * 1000,
			max: 1
		}

		if (params.length === 0) return message.reply(this.getAllMilestones())

		const level = params[0].match(levelRegex)[0]

		if (!level)
			return message.reply(
				'لازم تحدد الـ level اللي عايز تشيل منه الـ milestone'
			)

		try {
			message.reply('ايه اسم الـ achievement؟')

			const name = (await channel.awaitMessages(filter, awaitOptions)).first()
				.content

			this.client.controllers.levels.removeMilestone(level, name)

			message.reply('شيلت الـ milestone دي')
		} catch (err) {
			log(this.client, err, 'error')
		}
	}
}

module.exports = MilestoneRemove
