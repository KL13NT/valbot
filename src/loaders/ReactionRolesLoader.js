const { Loader, Command } = require('../structures')
const {
	getChannelObject,
	cacheMessage
} = require('../utils/utils')

/**
 * Loads commands based on commands/index
 */
class ReactionRolesLoader extends Loader {
	/**
	 *
	 * @param {ValClient} client used to attach loaded commands
	 */
	constructor (client) {
		super(client)
	}

	load () {
		// this.client.on('ready', () => {
		// 	this.client.database.on('ready', ()=>{
		// 		this.client.database
		// 			.getDb()
		// 			.collection('reactionroles')
		// 			.find()
		// 			.forEach(({ channelId, messageId }) => cacheMessage(getChannelObject(this.client, channelId), messageId))
		// 	})
		// })
	}
}

module.exports = ReactionRolesLoader