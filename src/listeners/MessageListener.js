const { CommandContext } = require(`..`)
const { Listener } = require(`../structures`)
const { CLIENT_ID } = process.env

module.exports = class MessageListener extends Listener {
	constructor (client) {
		super(client, [
			`message`
		])
	}

	async onMessage (message){
		if(message.author.id !== CLIENT_ID && message.type !== `dm`){
			if(message.content.startsWith(this.prefix)) message.reply(`commands aren't available yet, check again later.`)
			
			//TODO: perhaps implement a DB to collect deleted messages in case of false positives? Maybe a bit too overkill
			if(this.ToxicityFilter && this.ToxicityFilter.ready){
				if(await this.ToxicityFilter.classify(message.content)){
					message.reply(`please stop your toxic behaviour.`)
					await this.autoWarn(message)
					message.delete()
				}
			}
			// }
			// else if(message.mentions.members.has(CLIENT_ID)) this.onBotMention(message)
		}
	}

	onCommand (message){
		
	}


	onBotMention (message){
		message.reply(`I'm currently working on adding new commands, stop pinging me.`)
	}
}