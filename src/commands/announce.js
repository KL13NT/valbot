const Discord = require('discord.js')

const { Command } = require("../structures")
const { CommandOptions } = require("../structures")
const { log, getChannelObject, getRoleObject, notify } = require("../utils/utils")

const { AUTH_ADMIN } = require('../config/config')

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
			description: `بتعمل اعلان بالشكل اللي تحبه. ممكن كمان تستغل الـ webhook.`,
			exampleUsage: `<channel_id|channel_mention|"hook">`,
			extraParams: false,
			optionalParams: 1,
			auth: {
				method: 'ROLE',
				required: AUTH_ADMIN
			}
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

		const webhookID = '720259656299184148'
		const webhookToken = 'wDp4me4FSLPx4DTMFTQZiVfuQKieO96gWB1lqh2P5hW3Oufj1YA-MVeSHOC1LH9KQxPZ'

		const channelIdRegex = /(<#(\d+)>)|(\d+)/
		const channelIdMatch = params[0].match(channelIdRegex)


		try{
		if(channelIdMatch || params[0] === 'hook'){
			let target = {}

			if(channelIdMatch){
				const channelId = channelIdMatch[2] || channelIdMatch[3]
				const targetChannel = getChannelObject(this.client, channelId)

				if(!targetChannel) return message.reply('التشانل دي مش موجودة')
				if(targetChannel.type !== 'text') return message.reply('التشانل دي مش تيكست')

				target = targetChannel
			}
			else if(params[0] === 'hook'){
				target = new Discord.WebhookClient(webhookID, webhookToken)
			}


				message.reply('ابعت بقى الـ announcement')

				const collected = await channel.awaitMessages(filter, awaitOptions)
				const announcement = collected.first().content

				target.send(announcement).then(console.log)

			}
			else return message.reply('لازم تعمل منشن للتشانل او تكتب الاي دي بتاعها')
		}
		catch(err){
			message.reply(err.message)
		}
	}

}

module.exports = Announce