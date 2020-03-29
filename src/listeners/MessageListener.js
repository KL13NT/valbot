const { CLIENT_ID } = process.env
const { Listener } = require('../structures')

class MessageListener extends Listener {
	constructor (client) {
		super(client, [
			'message'
		])
	}

	async onMessage (message){
		const { content, author, type } = message
		const isToxic = await this.ToxicityFilter.classify(message)

		if(author.id !== CLIENT_ID && type !== 'dm'){
			//TODO: perhaps implement a DB to collect deleted messages in case of false positives? Maybe a bit too overkill
			if(this.ToxicityFilter && this.ToxicityFilter.ready && isToxic) return this.ToxicityFilter.warn(message)
			if(message.mentions.members.some(member => member.id === CLIENT_ID)) return this.emit('conversationMessage', message)
			if(content.startsWith(this.prefix)) return this.emit('command', message)
		}
	}
}

module.exports = MessageListener