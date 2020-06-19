const { CLIENT_ID, DEV_CLIENT_ID } = process.env
const { Listener } = require('../structures')

class MessageListener extends Listener {
	constructor(client) {
		super(client, ['message'])

		this.onMessage = this.onMessage.bind(this)
	}

	async onMessage(message) {
		const { prefix, controllers } = this.client
		const { conversation, levels, toxicity } = controllers
		const { content, author, type, mentions } = message

		if (
			author.id !== CLIENT_ID &&
			author.id !== DEV_CLIENT_ID &&
			type !== 'dm'
		) {
			const isToxic = await toxicity.classify(message)
			const isClientMentioned =
				mentions.members &&
				mentions.members.some(m => m.id === CLIENT_ID || m.id === DEV_CLIENT_ID)

			if (isToxic) return toxicity.handleToxic(message)

			if (content.startsWith(prefix)) this.client.emit('command', message)
			else if (isClientMentioned) conversation.converse(message, true)

			levels.message(message)
		}
	}
}

module.exports = MessageListener
