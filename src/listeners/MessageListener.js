const { CLIENT_ID, DEV_CLIENT_ID } = process.env
const { Listener } = require('../structures')

class MessageListener extends Listener {
	constructor (client) {
		super(client, [
			'message'
		])

		this.onMessage = this.onMessage.bind(this)
	}

	async onMessage (message){
		const { content, author, type } = message
		const isToxic = await this.client.ToxicityFilter.classify(message)
		const isClientMentioned = message.mentions.members.some(member => member.id === CLIENT_ID || member.id === DEV_CLIENT_ID)

		if(author.id !== CLIENT_ID && author.id !== DEV_CLIENT_ID && type !== 'dm'){

			//TODO: perhaps implement a DB to collect deleted messages in case of false positives? Maybe a bit too overkill
			if(this.ToxicityFilter && this.client.ToxicityFilter.ready && isToxic) return this.client.ToxicityFilter.warn(message)

			if(content.startsWith(this.client.prefix)) this.client.emit('command', message)
			else ConversationController.converse(message, isClientMentioned)

			LevelsController.message(message)
		}
	}
}

module.exports = MessageListener