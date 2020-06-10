const { Command } = require("../structures")
const { CommandOptions } = require("../structures")
const { log, getChannelObject, getRoleObject, notify } = require("../utils/utils")

class Announce extends Command {
	/**
	 * Constructs help command
	 * @param {ValClient} client
	 */
  constructor(client) {
		const options = new CommandOptions({
			name: `announce`,
			cooldown: 5 * 1000,
			nOfParams: 1,
			requiredRole: 'admin',
			description: `بتعمل اعلان بالشكل اللي تحبه`,
			exampleUsage: `val! announce <channel_id|channel_mention>`,
			extraParams: false,
			optionalParams: 0
		})

		super(client, options)
  }

  async _run(context) {
		const { message, member, params, channel } = context

		const filter = m => m.author.id === member.id
		const awaitOptions = {
			time: 60 * 1000,
			max: 1
		}

		const channelIdRegex = /(<#(\d+)>)|(\d+)/
		const channelIdMatch = params[0].match(channelIdRegex)


		if(channelIdMatch){
			const channelId = channelIdMatch[2] || channelIdMatch[3]
			const targetChannel = getChannelObject(this.client, channelId)

			if(!targetChannel) return message.reply('التشانل دي مش موجودة')

			try{
				message.reply('ابعت بقى الـ announcement')

				const collected = await channel.awaitMessages(filter, awaitOptions)
				const announcement = collected.first().content

				targetChannel.send(announcement)
			}
			catch(err){
				message.reply(err.message)
			}
		}
		else return message.reply('لازم تعمل منشن للتشانل او تكتب الاي دي بتاعها')
	}

}

module.exports = Announce