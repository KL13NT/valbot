const path = require('path')

const { CLIENT_ID, DEV_CLIENT_ID } = process.env
const { CommandContext } = require('..')
const { Listener } = require('../structures')
const { getMemberObject, getRoleObject, dmMember, sendEmbed } = require('../utils/utils')
const { getReactionRolesMessage } = require('../utils/database')
const { ROLE_ADDED, ROLE_REMOVED } = require('../config/events.json')

class ReactionRolesListener extends Listener {
	constructor (client) {
		super(client, [
			'messageReactionAdd',
			'messageReactionRemove'
		])

		this.onMessageReactionAdd = this.onMessageReactionAdd.bind(this)
		this.onMessageReactionRemove = this.onMessageReactionRemove.bind(this)
	}

	async onMessageReactionAdd (reaction, user){
		try{
			if(reaction.partial) await reaction.fetch()

			const messageId = reaction.message.id
			const channelId = reaction.message.channel.id
			const reactionId = reaction.emoji.id || reaction.emoji.name
			const message = await getReactionRolesMessage(this.client.database.getDb(), { messageId, channelId })

			if(message && message.reactions.some(reaction => reaction === reactionId)){

				const member = getMemberObject(this.client, user.id)
				const embedOptions = {
					member,
					embedOptions: {
						title: 'Role Added',
						description: `${ROLE_ADDED} ${getRoleObject(this.client, message.roleId).name}`
					}
				}

				member.roles.add(message.roleId).then(() => sendEmbed(null, embedOptions))
			}
		}
		catch(err){
			console.log(err)
		}
	}

	async onMessageReactionRemove (reaction, user){
		if(reaction.partial) await reaction.fetch()
		
		const messageId = reaction.message.id
		const channelId = reaction.message.channel.id
		const reactionId = reaction.emoji.id || reaction.emoji.name
		const message = await getReactionRolesMessage(this.client.database.getDb(), { messageId, channelId })

		try {
			if(message && message.reactions.some(reaction => reaction === reactionId)){

				const member = getMemberObject(this.client, user.id)
				const embedOptions = {
					member,
					embedOptions: {
						title: 'Role Removed',
						description: `${ROLE_REMOVED} ${getRoleObject(this.client, message.roleId).name}`
					}
				}

				member.roles.remove(message.roleId).then(() => sendEmbed(null, embedOptions))
			}
		}
		catch(err){
			console.log(err)
		}
	}
}

module.exports = ReactionRolesListener