const { Command } = require('../structures')
const { CommandOptions } = require('../structures')
const {
	log,
	getMemberObject,
	getRoleObject,
	notify
} = require('../utils/utils')

class MilestoneAdd extends Command {
	/**
	 * Constructs help command
	 * @param {ValClient} client
	 */
	constructor(client) {
		const options = new CommandOptions({
			name: `milestoneadd`,
			cooldown: 1000,
			nOfParams: 2,
			requiredRole: 'admin',
			description: `بتحدد achievement تدي الميمبرز روول معين عند ليفل معين.`,
			exampleUsage: `<level> <role_name|role_id>`,
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

		const levelRegex = /^(\d+)$/i
		const roleNameRegex = /^(\S+)$/i
		const roleIDRegex = /^(\d+)$/i
		const nameRegex = /([a-zA-Z0-9 ]{1,40})/i
		const descriptionRegex = /(.{30,300})/i

		const filter = m => m.author.id === member.id
		const awaitOptions = {
			time: 60 * 1000,
			max: 1
		}

		const level = params[0].match(levelRegex)[0]
		const roleIDNameMatch =
			params[1].match(roleIDRegex) || params[1].match(roleNameRegex)

		if (!level)
			return message.reply(
				'لازم تحدد الـ level اللي عايز تعمل عليه الـ milestone'
			)

		if (!roleIDNameMatch)
			return message.reply('لازم تكتب اسم او الاي دي بتاع الروول')

		try {
			const roleIDName = roleIDNameMatch[1]
			const role = getRoleObject(this.client, roleIDName)

			if (typeof role !== 'object')
				return message.reply('لازم ال role يكون موجود في السيرفر')

			message.reply('ايه اسم الـ achievement؟')

			const name = (await channel.awaitMessages(filter, awaitOptions)).first()
				.content

			if (!nameRegex.test(name))
				return message.reply(
					'الاسم لازم يبقى مابين 1 و 40 حرف, و يبقى فيه حروف و مسافات و ارقام فقط و يكون انجلش'
				)

			message.reply('ايه وصف الـ achievement؟')

			const description = (
				await channel.awaitMessages(filter, awaitOptions)
			).first().content

			if (!descriptionRegex.test(description))
				return message.reply('الوصف لازم يكون مابين 30 و 300 حرف, و يكون انجلش')

			this.client.controllers.levels.addMilestone(
				level,
				name,
				description,
				role.id
			)

			message.reply('ضيفت الـ milestone دي. ')
		} catch (err) {
			log(this.client, err, 'error')
		}
	}
}

module.exports = MilestoneAdd
