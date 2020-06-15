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
		const { content, author, type, mentions } = message
		const isToxic = await this.client.ToxicityFilter.classify(message)
		const isClientMentioned = mentions.members
			&& mentions.members.some(
				m => m.id === CLIENT_ID || m.id === DEV_CLIENT_ID
			)

		if(author.id !== CLIENT_ID && author.id !== DEV_CLIENT_ID && type !== 'dm'){

			if(this.ToxicityFilter && this.client.ToxicityFilter.ready && isToxic) return this.client.ToxicityFilter.warn(message)

			if(content.startsWith(this.client.prefix)) this.client.emit('command', message)
			else if(isClientMentioned) ConversationController.converse(message, true)

			LevelsController.message(message)
		}
	}
}

module.exports = MessageListener