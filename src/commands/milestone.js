const { Command } = require("../structures")
const { CommandOptions } = require("../structures")
const { log, getMemberObject, getRoleObject, notify } = require("../utils/utils")

class Milestone extends Command {
	/**
	 * Constructs help command
	 * @param {ValClient} client
	 */
  constructor(client) {
		const options = new CommandOptions({
			name: `milestone`,
			cooldown: 1000,
			nOfParams: 3,
			requiredRole: 'admin',
			description: `بتحدد achievement تدي الميمبرز روول معين عند ليفل معين. ممكن متديهاش باراميتيرز و هتجيبلك كل ال achievements الموجودة`,
			exampleUsage: `val! milestone add <level> <role_name|role_id>\nval! milestone remove <level> <milestone_name>`,
			extraParams: false,
			optionalParams: 3
		})

		super(client, options)

		this.getAllMilestones = this.getAllMilestones.bind(this)
  }

  async _run(context) {
		const { message, member, params, channel } = context

		const actionRegex = /(add|remove)/i
		const levelRegex = /(\d+)/i
		const roleNameRegex = /(\S+)/i
		const roleIDRegex = /(\d+)/i
		const nameRegex = /([a-zA-Z0-9 ]{1,40})/i
		const descriptionRegex = /(.{30,300})/i

		const filter = m => m.author.id === member.id
		const awaitOptions = {
			time: 60 * 1000,
			max: 1
		}

		if(params.length === 0) return message.reply(this.getAllMilestones())

		const action = params[0].match(actionRegex)[1]
		const level = params[1].match(levelRegex)[1]
		const roleIDNameMatch = params[2].match(roleIDRegex) || params[2].match(roleNameRegex)


		if(!action)
		return message.reply('لازم تحدد اكشن معينة: `set` او `remove`')

		if(!level)
		return message.reply('لازم تحدد الـ level اللي عايز تعمل عليه الـ milestone')

		if(!roleIDNameMatch)
		return message.reply('لازم تكتب اسم او الاي دي بتاع الروول')

		try{
			if(action === 'add'){
				const roleIDName = roleIDNameMatch[1]
				const role = getRoleObject(this.client, roleIDName)

				if(typeof role !== 'object') return message.reply('لازم ال role يكون موجود في السيرفر')

				message.reply('ايه اسم الـ achievement؟')

				const name = (await channel.awaitMessages(filter, awaitOptions)).first().content

				if(!nameRegex.test(name)) return message.reply('الاسم لازم يبقى مابين 1 و 40 حرف, و يبقى فيه حروف و مسافات و ارقام فقط و يكون انجلش')

				message.reply('ايه وصف الـ achievement؟')

				const description = (await channel.awaitMessages(filter, awaitOptions)).first().content

				if(!descriptionRegex.test(description)) return message.reply('الوصف لازم يكون مابين 30 و 300 حرف, و يكون انجلش')

				LevelsController.addMilestone(level, name, description, role.id)

				message.reply('ضيفت الـ milestone دي. ')
			}
			else {
				const name = roleIDNameMatch[1]
				LevelsController.removeMilestone(level, name)

				message.reply('شيلت الـ milestone دي')
			}
		}
		catch(err){
			console.log(err)
		}
	}

	getAllMilestones(){
		let milestones = '\n'

		Object.keys(LevelsController.milestones).forEach(level => {
			milestones += `Level #${level} Achievements\n${'-'.repeat(30)}\n`

			LevelsController.milestones[level].forEach(({name, description, roleID}) => {

				const role = getRoleObject(this.client, roleID)
				milestones += `Name: ${name}\nDescription: ${description}\nRole: ${role.name}\n\n`

			})
		})

		return milestones
	}
}

module.exports = Milestone