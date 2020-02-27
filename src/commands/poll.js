const { Command } = require("../structures")
const { CommandOptions } = require("../structures")

class Poll extends Command {
  constructor(client) {

		const options = new CommandOptions(
			`poll`,
			10 * 60 * 1000,
			1,
			2,
			`بتعمل استفتاء جديد, خاصة بالمسؤولين فقط`,
			`val! poll`
		)

		super(client, options)
  }

  async _run(context) {
		const { message, params, channel } = context

		message.reply('')
	}

}

module.exports = Poll