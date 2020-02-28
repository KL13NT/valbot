const { Command } = require("../structures")
const { CommandOptions } = require("../structures")
const { getChannelObject } = require('../utils/utils')
const { GENERIC_COMMAND_GRACEFUL_ERROR, ERROR_GENERIC_SOMETHING_WENT_WRONG, GENERIC_CONTROLLED_COMMAND_CANCEL } = require('../config/events.json')

class Poll extends Command {
  constructor(client) {

		const options = new CommandOptions({
			name: `poll`,
			cooldown: 10 * 60 * 1000,
			nOfParams: 0,
			requiredAuthLevel: 2,
			description: `بتعمل استفتاء جديد, خاصة بالمسؤولين فقط`,
			exampleUsage: `val! poll`
		})

		super(client, options)

  }

	/**
	 * @param {CommandContext} context
	 */
	async _run(context) {
		// this command is a `this` hell
		const { message, channel, member } = context
		const { polls } = process.IMPORTANT_CHANNELS
		const pollsChannel = getChannelObject(this.client, polls)

		const poll = {
			content: '',
			reactions: [],
			message: {}
		}

		message.reply('ابعت بقى رسالة فيها محتوى الاستفتاء و حط الريأكشنز اللي انت عايزها عليها')

		let isCancelled = false
		try{
			await channel.awaitMessages(collected => {
				if(collected.member.id === member.id){
					if(collected.content === 'cancel') isCancelled = true
					else if(poll.content === ''){
						poll.message = collected
						poll.content = collected.content
						message.reply('حلو قدامك 60 ثانية عشان تقول فينيش او كانسل بنفسك, ريأكت عليها بقى و لما تخلص اكتب finish او اعمل cancel')
					}
				}
			}, { max: 4 })

			if(isCancelled) this.stop(context, true)
			else if(poll.content === '') this.stop(context, false, GENERIC_COMMAND_GRACEFUL_ERROR)
			else {

				poll.reactions = Array.from(poll.message.reactions.values()).map(reaction => reaction.emoji.id? reaction.emoji.id: reaction.emoji.name)
				message.reply('بعمل الاستفتاء اهو')

				pollsChannel
					.send(poll.content)
					.then(pollMessage => poll.reactions.forEach(reaction => pollMessage.react(reaction)))
					.catch(err => this.stop(context, false))

			}
		}
		catch(err){
			console.log(err)
			this.stop(context, false)
		}
	}
}

module.exports = Poll