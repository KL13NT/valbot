const { Command, CommandOptions } = require(`../structures`)
const FileUtils = require('../utils/FileUtils')
const reactionRolesJSONPath = '../config/reaction-roles.json'

const {
	getChannelObject,
	getMessageObject,
	getRoleObject
} = require('../utils/utils')

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
			const [channelId, messageId, roleId] = params

			let isCancelled = false

			const messageChannel = getChannelObject(this.client, channelId) || null
			const reactionMessage = messageChannel !== null? getMessageObject(this.client, messageChannel, messageId): null
			const reactionRole = getRoleObject(this.client, roleId) || null


			if(typeof messageChannel === null) throw Error(ERROR_CHANNEL_NOT_FOUND)
			if(typeof reactionMessage === null) throw Error(ERROR_MESSAGE_NOT_FOUND)
			if(typeof reactionRole === null) throw Error(ERROR_ROLE_NOT_FOUND)

			message.reply('دلوقتي بقى اعمل الريأكشنز بتاعتك على الرسالة دي و ابعت finish او cancel').then(sent => {
				const collector = channel.createMessageCollector(collected => collected.member.id === member.id)

				collector.on('collect', collected => {
					if(collected.content === 'cancel' && collected.member.id === member.id) isCancelled = true

					collector.stop()
				})

				collector.on('end', () => {
					if(isCancelled) return message.reply('لغيت خلاص')

					const watched = {
						messageId,
						channelId,
						roleId,
						reactions: Array.from(sent.reactions.cache.values()).map(reaction => reaction.emoji.id || reaction.emoji.name)
					}

					let watchedMessages = []

					if(FileUtils.fileExists(reactionRolesJSONPath, __dirname)) watchedMessages = JSON.parse(FileUtils.read(reactionRolesJSONPath, __dirname))
					if(isDuplicateReaction(watchedMessages, watched)) return message.reply('موجودة الريدي يبشا, جربوا تاني بريأكشن مختلفة')

					watchedMessages.push(watched)
					FileUtils.replace(reactionRolesJSONPath, JSON.stringify(watchedMessages), __dirname)

					return message.reply('تم التظبيط')
				})
			})
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