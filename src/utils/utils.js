const { MessageEmbed } = require('discord.js')
const { ERROR_COMMANDS_REQUIRE_2_PARAMS } = require('../config/events.json')



/**
 * @typedef {object} EmbedOptions
 * @property {GuildMember} member
 * @property {object} embedOptions
 * @property {object[]} fields
 * @property {object[]} attachments
 * @property {GuildChannel[]} channels
 * @property {function} callback
 */
async function warn (message){
	message.member.addRole()
}


/**
 * Caches messages based on a channel object and a message id. If failed to cache, retries.
 * @param {TextChannel} channel
 * @param {string} messageId
 */
function cacheMessage (channel, messageId){
	channel.messages.fetch(messageId, true).catch(err => {
		if(err.code !== 10008) return cacheMessage(channel, messageId)
	})
}

/**
 * Reacts with a given array of reactions to a message
 * @param {Message} message
 * @param {string} reactions
 */
function react (message, reactions = []){
	reactions.forEach(reaction => message.react(reaction).catch(err => console.log(err)))
}


/**
 *
 * @param {Message} message - message
 * @param {EmbedOptions} options - Destructured object
 */
async function sendEmbed (message, { member, embedOptions, fields, attachments, channels, reactions = [], callback }) {
	try{
		const embed = new MessageEmbed(embedOptions)
		embed.setThumbnail('https://github.com/KL13NT/valbot/raw/development/src/media/valarium-bot-prod.png')
		embed.setColor('#f9a826')

		if(fields)
			fields.forEach(field =>
				field.inline || field.name === 'Moderator' || field.name === 'Member'
					? embed.addField(field.name, field.value, true)
					: embed.addField(field.name, field.value))

		if(attachments) attachments.forEach(attachment => embed.attachFile(attachment.path))
		if(channels) channels.forEach(channel => channel.send(embed).then(sent => react(sent, reactions)))

		if(member){
			const DMChannel = await member.createDM()
			DMChannel.send(embed).then(sent => react(sent, reactions))
		}

		if(callback) callback(embed)
	}
	catch(err){
		console.log(err)
		if(message) message.reply('في حاجة غلط حصلت. جرب تاني بعدين او بص ف اللوجز لو انت ديف')
	}
}


/**
 * @param {ValClient} client
 * @param {string} channelId
 * @returns {GuildChannel}
 */
function getChannelObject (client, channelId){
	const isDevelopment = process.env.MODE === 'DEVELOPMENT'
	// const testChannelId = process.IMPORTANT_CHANNELS.test

	return client.guilds.cache
		.find(guild => guild.name === 'VALARIUM').channels.cache
		.find(ch => isDevelopment? ch.id === channelId: ch.id === channelId)
}


/**
 * @param {ValClient} client
 * @param {string} roleId|rolename
 */
function getRoleObject (client, roleID){
	return client.guilds.cache
		.find(guild => guild.name === 'VALARIUM').roles.cache
		.find(role => {
			if(/\d+/.test(roleID)) return role.id === roleID
			else return role.name === roleID
		})
}

/**
 *
 * @param {TextChannel} channel
 * @param {string} messageId
 */
async function getMessageObject (channel, messageId){
	return await channel.messages.fetch(messageId) || null
}

function dmMember (member, content){
	try{
		member.createDM().then(dm => dm.send(content))
	}
	catch(err){
		console.log(err)
	}
}

/**
 * @param {ValClient} client
 * @param {string} channelId
 */
function getMemberObject (client, userId){
	return client.guilds.cache
		.find(guild => guild.name === 'VALARIUM').members.cache
		.find(member => member.id === userId)
}


/**
 * Recursively deep-freezes objects
 * @param {object} object object to freeze
 */
function deepFreeze (object) {
	const keys = Object.keys(object)

	for (const key of keys) {
		const value = object[key]

		if(value && typeof value === 'object') {
			deepFreeze(value)
		}
	}

	return Object.freeze(object)
}

/**
 * Returns whether an element is in a set of elements
 * @param {*} matcher element to check
 * @param {array} possibilities possibilities
 */
function isOneOf (matcher, possibilities){
	for(const possibility of possibilities){
		if(matcher === possibility) return true
	}
}

/**
 *
 * @param {*} client
 * @param {*} notification
 * @param {*} alertLevel
 */
function log (client, notification, alertLevel){

	const statusEmoji = alertLevel === 'info'? ':grey_question:': alertLevel === 'warn'? ':warning:': ':x:'
	const isProduction = process.env.MODE === 'PRODUCTION'

	if(isProduction){
		if(client.ready){
			const botStatusChannel = client.config.IMPORTANT_CHANNELS['bot_status']
			const fullNotification = `${statusEmoji} ${notification} ${alertLevel === 'error' || alertLevel === 'warn'? '<@&639855023970451457>': ''}`

			console.log(`[${alertLevel}] ${notification}`)
			botStatusChannel.send(fullNotification)
		}
		else {
			if(typeof QueueController !== 'undefined') QueueController.enqueue(log, client, notification, alertLevel)
		}
	}
	else console.log(`[${alertLevel}] ${notification}`)
}

/**
 *
 * @param {*} client
 * @param {*} notification
 * @param {*} alertLevel
 */
async function notify (client, notification, embed){
	try{
		if(client.ready){
			//REFACTORME: have better logic for important config stuff
			const isDevelopment = process.env.MODE === 'DEVELOPMENT'
			const notificationsChannel = client.config.IMPORTANT_CHANNELS[isDevelopment? 'test': 'notifications']
			notificationsChannel.send(notification, { embed })
		}
		else {
			QueueController.enqueue(notify, client, notification)
		}
	}
	catch(err){
		console.log(err)
		log(client, err.message, 'error')
	}
}

/**
 *
 * @param {*} messageContent
 */
function calculateUniqueWords (messageContent){
	const unique = {}

	return messageContent.split(' ').filter(word => {
		if(!unique[word] && word.length >= 2){
			unique[word] = word
			return true
		}

		return false
	}).length
}

/**
 * Generates an event string dynamically based on events.json
 * @param {*} client
 * @param {*} event
 */
function generateEvent (client, event, content){
	let generated = event

	Object.keys(content).forEach(variable => {
		generated = generated.replace(new RegExp(`{{${variable}}}`), content[variable])
	})

	return generated
}

/**
 * returns a parsed level string
 * @param {*} securityLevel
 */
function translateSecurityLevel (securityLevel){
	/**
 * @typedef {object} AuthLevels
 * @property {number} 0 Developers
 * @property {number} 1 High Table [admin]
 * @property {number} 2 Protectors [mod]
 * @property {number} 3 Verified members role
 * @property {number} 4 Everyone
 */

	/**
	* TODO: move logic out of here,
	* perhaps replace all levels across codebase with objects
	* {
		levelInt: 0|1|2|3|4,
		levelString: Developer
	}
	*/
	// if(securityLevel)

}


module.exports = {
	sendEmbed,
	getChannelObject,
	getRoleObject,
	getMessageObject,
	deepFreeze,
	cacheMessage,
	getMemberObject,
	dmMember,
	log,
	notify,
	generateEvent,
	calculateUniqueWords
}