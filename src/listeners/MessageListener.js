const { CLIENT_ID, DEV_CLIENT_ID } = process.env
const { Listener } = require('../structures')

class MessageListener extends Listener {
	constructor(client) {
		super(client, ['message'])

		this.onMessage = this.onMessage.bind(this)
	}

	async onMessage(message) {
		const { content, author, type, mentions } = message

		const isToxic = await this.client.controllers.toxicity.classify(message)
		const isClientMentioned =
			mentions.members &&
			mentions.members.some(m => m.id === CLIENT_ID || m.id === DEV_CLIENT_ID)

		if (
			author.id !== CLIENT_ID &&
			author.id !== DEV_CLIENT_ID &&
			type !== 'dm'
		) {
			if (isToxic) return this.client.controllers.toxicity.handleToxic(message)

			if (content.startsWith(this.client.prefix))
				this.client.emit('command', message)
			else if (isClientMentioned)
				this.client.controllers.conversation.converse(message, true)

			this.client.controllers.levels.message(message)
		}
	}
}

module.exports = MessageListener
