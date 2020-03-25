const path = require('path')

const { CLIENT_ID, DEV_CLIENT_ID } = process.env
const { CommandContext } = require('..')
const { Listener } = require('../structures')
const { getMemberObject, getRoleObject, dmMember, sendEmbed } = require('../utils/utils')
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
		console.log('Message Reaction Add!')

		const messageId = reaction.message.id
		const channelId = reaction.message.channel.id
		const reactionId = reaction.emoji.id || reaction.emoji.name

		const message = require('../config/reaction-roles.json')
			.find( message =>
				channelId === message.channelId
				&& messageId === message.messageId
				&& message.reactions.some(reaction => reaction === reactionId || reaction === reactionId)
			)

		if(message){
			try{
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
			catch(err){
				console.log(err)
			}
		}
	}

	async onMessageReactionRemove (reaction, user){
		console.log('Message Reaction Removed!')

		const messageId = reaction.message.id
		const channelId = reaction.message.channel.id
		const reactionId = reaction.emoji.id || reaction.emoji.name

		const message = require('../config/reaction-roles.json')
			.find( message =>
				channelId === message.channelId
				&& messageId === message.messageId
				&& message.reactions.some(reaction => reaction === reactionId || reaction === reactionId)
			)

		if(message){
			try{
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
			catch(err){
				console.log(err)
			}
		}
	}

}

module.exports = ReactionRolesListener