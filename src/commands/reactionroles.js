const { Command, CommandOptions } = require(`../structures`)
const FileUtils = require('../utils/FileUtils')
const reactionRolesJSONPath = '../config/reaction-roles.json'

const {
	getChannelObject,
	getMessageObject,
	getRoleObject,
} = require('../utils/utils')

const {
	reactionRolesMessageAdd,
	reactionRolesMessageExists
} = require('../utils/database')

const {
	ERROR_CHANNEL_NOT_FOUND,
	ERROR_MESSAGE_NOT_FOUND,
	ERROR_ROLE_NOT_FOUND,
	ERROR_CHANNEL_TYPE_MISMATCH
} = require('../config/events.json')


class ReactionRoles extends Command{
	constructor (client){
		const commandOptions = new CommandOptions({
      name: `reactionroles`,
			cooldown: 10 * 1000,
			nOfParams: 3,
			requiredAuthLevel: 1,
			description: `بتضيف روولز على حسب الريأكشنز و خاصة بالمدراء`,
			exampleUsage: `val! reactionroles <channel_id> <message_id> <role_id>`,
			extraParams: false
    })
    super(client, commandOptions)
	}

	async _run(context){
		try{
			const { message, params, channel, member } = context
			const [ channelId, messageId, roleId ] = params
			const db = this.client.database.getDb()

			const messageChannel = getChannelObject(this.client, channelId) || null
			const reactionMessage = messageChannel !== null? await getMessageObject(messageChannel, messageId): null
			const reactionRole = getRoleObject(this.client, roleId) || null

			if(typeof messageChannel === null) throw Error(ERROR_CHANNEL_NOT_FOUND)
			if(typeof reactionMessage === null) throw Error(ERROR_MESSAGE_NOT_FOUND)
			if(typeof reactionRole === null) throw Error(ERROR_ROLE_NOT_FOUND)

			const sent = await message.reply('دلوقتي بقى اعمل الريأكشنز بتاعتك على الرسالة دي و ابعت finish او cancel')
			const collected = await channel.awaitMessages(collected => collected.member.id === member.id, { max: 1, time: 60000 })

			if(collected.some(msg => msg.content === 'cancel')) return this.cancel(context, true)

			const watched = {
				messageId,
				channelId,
				roleId,
				reactions: Array.from(sent.reactions.cache.values()).map(reaction => reaction.emoji.id || reaction.emoji.name)
			}

			if(reactionRolesMessageExists(db, watched)) throw Error('موجودة الريدي يبشا, جربوا تاني بريأكشن مختلفة')
			await reactionRolesMessageAdd(db, watched)

			return message.reply('تم التظبيط')
		}
		catch(err){
			console.error(err)
			context.message.reply(err.message)
		}
	}
}

function isDuplicateReaction(watchedMessages, { messageId, channelId, roleId, reactions }){
	return watchedMessages.some(watchedMessage =>
		watchedMessage.messageId === messageId
		&& watchedMessage.channelId === channelId
		&& watchedMessage.roleId === roleId
		&& JSON.stringify(watchedMessage.reactions) === JSON.stringify(reactions)
	)
}

module.exports = ReactionRoles