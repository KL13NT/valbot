const { Command } = require("../structures")
const { CommandOptions } = require("../structures")

class Clear extends Command {
  constructor(client) {
		const options = new CommandOptions(`clear`, 1000, 2, 1)
    super(client, options)
  }

  async run(context) {
		const { message, params, channel } = context
		const count = parseInt(params[0])

		if(count === 0) {
			message.reply('لما تكتب صفر للكوماند دي هتخلي ديسكورد يمسح كل الرسايل اللي ف التشانل! جرب رقم تاني')
			return
		}

		await channel.bulkDelete(count)
		// deletedMessages = deletedMessages.map(message => ({ author: { name: message.author.username, id: message.author.id }, content: message.content }))
		// __ENV.__DATABASE_OBJECT.collection('DELETED_MESSAGES').insertMany(deletedMessages)

		message.reply(`مسحت ${count} رسايل. تحب اجيبلك كوبايتين لمون؟`)
	}

}

module.exports = Clear