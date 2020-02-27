const { Command } = require("../structures")
const { CommandOptions } = require("../structures")

class Clear extends Command {
  constructor(client) {

		const options = new CommandOptions({
			name: `clear`,
			cooldown: 1000,
			nOfParams: 1,
			requiredAuthLevel: 2,
			description: `بتمسح رسايل بعدد n`,
			exampleUsage: `val! clear 5`
		})

		super(client, options)
  }

  async _run(context) {
		const { message, params, channel } = context
		const numbersRegex = /\d+/

		if(numbersRegex.test(params[0])){
			const count = parseInt(params[0])

			if(count === 0) {
				message.reply('لما تكتب صفر للكوماند دي هتخلي ديسكورد يمسح كل الرسايل اللي ف التشانل! جرب رقم تاني')
				return
			}

			await channel.bulkDelete(count)
			message.reply(`مسحت ${count} رسايل. تحب اجيبلك كوبايتين لمون؟`)

		}
		else message.reply(`لازم تدخل رقم كـتالت باراميتير للكوماند دي`)
	}

}

module.exports = Clear