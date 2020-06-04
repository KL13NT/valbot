const { Command } = require("../structures")
const { CommandOptions } = require("../structures")
const { log, getMemberObject, getRoleObject, notify } = require("../utils/utils")

class Giverole extends Command {
	/**
	 * Constructs help command
	 * @param {ValClient} client
	 */
  constructor(client) {
		const options = new CommandOptions({
			name: `giverole`,
			cooldown: 1000,
			nOfParams: 2,
			requiredAuthLevel: 2,
			description: `بتدري لميمبر روول معين`,
			exampleUsage: `val! giverole @Sovereign#4984 <role_name|role_id>`,
			extraParams: false
		})

		super(client, options)
  }

  async _run(context) {
		const { message, params, channel } = context
		const roleNameRegex = /\w+/i
		const roleIDRegex = /\d+/i
		const mentionRegex = /<@!(\d+)>/

		if(!roleNameRegex.test(params[1]) && !roleID.test(params[1]))
			return message.reply('لازم تكتب اسم او الاي دي بتاع الروول')

		if(!mentionRegex.test(params[0]))
			return message.reply('لازم تعمل منشن للميمبر اللي عايز تديله الروول ده')

		const roleID = params[1].match(roleNameRegex)[0] || params[1].match(roleIDRegex)[0]
		const targetMemberID = params[0].match(mentionRegex)[1]

		const role = getRoleObject(this.client, roleID)
		const member = getMemberObject(this.client, targetMemberID)

		member.roles.add(role)
			.then(()=>{
				nchannel.send(`<@!${targetMemberID}>, جالك روول ${role.name}`)
				message.reply(`اديت الميمبر ده روول ${role.name}`)
			})
			.catch(err => {
				console.log(err)
				message.reply(err.message)
			})
	}
}

module.exports = Giverole