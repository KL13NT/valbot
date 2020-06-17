const { Command } = require("../structures")
const { CommandOptions } = require("../structures")
const { getChannelObject, sendEmbed } = require('../utils/utils')
const {
	GENERIC_COMMAND_GRACEFUL_ERROR,
	ERROR_GENERIC_SOMETHING_WENT_WRONG,
	GENERIC_CONTROLLED_COMMAND_CANCEL
} = require('../config/events.json')

const { AUTH_MOD } = require('../config/config.js').AUTH

class Poll extends Command {
  constructor(client) {

		const options = new CommandOptions({
			name: `poll`,
			cooldown: 10 * 60 * 1000,
			nOfParams: 0,
			description: `بتعمل استفتاء جديد, خاصة بالمسؤولين فقط`,
			exampleUsage: `poll`,
			extraParams: false,
			auth: {
				method: 'ROLE',
				required: AUTH_MOD
			}
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
			title: '',
			content: '',
			reactions: [],
			message: {}
		}

		message.reply('ابعت بقى رسالة فيها عنوان الاستفتاء. مش هتقدر تلغي الا ف الاخر خالص.')

		try{
			const collector = channel.createMessageCollector(
				collected => collected.member.id === member.id
			)

			collector.on('collect', collected => {
				if(collected.member.id === member.id){
					if(collected.content === 'cancel') {
						collector.stop()
						return this.stop(context, true)
					}
					else if(poll.title === ''){
						message.reply('حلو, ابعتلي بقى تفاصيل الاستفتاء ده')
						poll.title = collected.content
					}
					else if(poll.content === ''){
						poll.content = collected.content
						message
							.reply('تمام, دلوقتي بقى ريأكت على الرسالة دي بالريأكشنز اللي انت عايزها و لما تخلص اكتبلي اي حاجة وانا هفهم')
							.then(sent => poll.message = sent)
					}
					else {
						message.reply('اشطة عليك, ثواني بظبط كبايتين شاي')
						collector.stop()
						return this.createPoll(poll)
					}
				}
			})
		}
		catch(err){
			console.log(err)
			return this.stop(context, false, err)
		}
	}

	async createPoll(poll){
		if(poll.content === '' || poll.title === '')
			this.stop(context, false, GENERIC_COMMAND_GRACEFUL_ERROR)

		else {
			poll.reactions = Array.from(poll.message.reactions.cache.values()).map(
				reaction => reaction.emoji.id || reaction.emoji.name
			)

			message.reply('بعمل الاستفتاء اهو')

			const embedOptions = {
				embedOptions: {
					title: `${poll.title} Poll`,
					description: `${message.member} has started a new poll`
				},
				fields: [
					{
						name: 'Moderator',
						value: message.member,
						inline: true
					},
					{
						name: 'Date',
						value: new Date().toUTCString(),
						inline: true
					},
					{
						name: 'Description',
						value: poll.content
					},
					{
						name: 'CC',
						value: `<@&571705643073929226> <@&571705797583831040> <@&586805502223187968> <@&586805619499991050>`
					},
				],
				channels: [pollsChannel],
				reactions: poll.reactions
			}

			const mentions = [
				'<@&571705643073929226>',
				'<@&571705797583831040>',
				'<@&586805502223187968>',
				'<@&586805619499991050>'
			]

			const finalMessage = `**${poll.title}**\n${poll.content}\n${mentions.join(' ')}`

			const errorHandler = err => (console.log(err), message.reply('في حاجة حصلت وانا بعمل الاستفتاء. جرب تاني او بص ف اللوجز'))
			const reactByAll = sentPollMessage => poll.reactions.forEach(reaction => sentPollMessage.react(reaction).catch(errorHandler))

			if(poll.content.length > 1000) {
				if(finalMessage.length > 2000) return message.reply(`احم... بص, الرسالة طويلة اوي و مش هعرف ابعتها. قصر الموضوع شوية و جرب تاني. محتاج تشيل ${finalMessage.length - 2000} حرف`)

				pollsChannel.send(finalMessage).then(reactByAll).catch(errorHandler)
			}
			else sendEmbed(message, embedOptions).catch(errorHandler)
		}
	}
}

module.exports = Poll