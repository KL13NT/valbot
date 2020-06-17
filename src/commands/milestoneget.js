const { Command } = require('../structures')
const { CommandOptions } = require('../structures')
const {
	log,
	getMemberObject,
	getRoleObject,
	notify
} = require('../utils/utils')

class MilestoneGet extends Command {
	/**
	 * Constructs help command
	 * @param {ValClient} client
	 */
	constructor(client) {
		const options = new CommandOptions({
			name: `milestoneget`,
			cooldown: 1000,
			nOfParams: 1,
			description: `بتجيبلكوا الـ milestone اللي عايزنها في level معين. ممكن مديهاش level فا تجيبلكوا كل ال milestones`,
			exampleUsage: `<level>`,
			extraParams: false,
			optionalParams: 1,
			auth: {
				method: 'ROLE',
				required: 'AUTH_ADMIN'
			}
		})

		super(client, options)

		this.getAllMilestones = this.getAllMilestones.bind(this)
	}

	async _run(context) {
		const { message, member, params } = context

		const levelRegex = /^(\d+)$/i

		try {
			if (params.length === 0) return message.reply(this.getAllMilestones())

			const levelMatch = params[0].match(levelRegex)
			if (!levelMatch)
				return message.reply('تاني باراميتير لازم يكون رقم الـ level')

			return message.reply(this.getLevelMilestones(Number(levelMatch[0])))
		} catch (err) {
			log(this.client, err, 'error')
		}
	}

	getLevelMilestones(level) {
		const milestones = this.client.controllers.levels.getMilestone(level)

		if (!milestones) return 'مفيش milestones للـ level ده'
		else {
			let milestonesString = `Level #${level} Achievements\n${'-'.repeat(30)}\n`

			milestones.forEach(({ name, description, roleID }) => {
				const role = getRoleObject(this.client, roleID)
				milestonesString += `Name: ${name}\nDescription: ${description}\nRole: ${role.name}\n\n`
			})

			return milestonesString
		}
	}

	getAllMilestones() {
		let milestones = '\n'

		if (Object.keys(this.client.controllers.levels.milestones).length === 0)
			return 'مفيش milestones خالص'

		Object.keys(this.client.controllers.levels.milestones).forEach(level => {
			milestones += `Level #${level} Achievements\n${'-'.repeat(30)}\n`

			this.client.controllers.levels.milestones[level].forEach(
				({ name, description, roleID }) => {
					const role = getRoleObject(this.client, roleID)
					milestones += `Name: ${name}\nDescription: ${description}\nRole: ${role.name}\n\n`
				}
			)
		})

		return milestones
	}
}

module.exports = MilestoneGet
