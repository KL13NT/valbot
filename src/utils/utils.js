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

/**
 * Caches messages based on a channel object and a message id. If failed to cache, retries.
 * @param {TextChannel} channel
 * @param {string} messageId
 */
function cacheMessage(channel, messageId) {
	channel.messages.fetch(messageId, true).catch(err => {
		if (err.code !== 10008) return cacheMessage(channel, messageId)
	})
}

/**
 *
 * @param {EmbedOptions} options - Destructured object
 */
function createEmbed({ fields, attachments, ...embedOptions }) {
	const embed = new MessageEmbed(embedOptions)
		.setColor('#ffcc5c')
		.setTimestamp()

	if (fields)
		fields.forEach(field =>
			embed.addField(
				field.name,
				field.value,
				field.inline || field.name === 'Moderator' || field.name === 'Member'
			)
		)

	if (attachments)
		attachments.forEach(attachment => embed.attachFile(attachment.path))

	return embed
}

/**
 * @param {ValClient} client
 * @param {string} channelId
 * @returns {GuildChannel}
 */
function getChannelObject(client, channelId) {
	return client.guilds.cache
		.find(guild => guild.name === 'VALARIUM')
		.channels.cache.find(ch => ch.id === channelId)
}

/**
 * @param {ValClient} client
 * @param {string} roleId|rolename
 */
function getRoleObject(client, roleID) {
	return client.guilds.cache
		.find(guild => guild.name === 'VALARIUM')
		.roles.cache.find(role => {
			if (/\d+/.test(roleID)) return role.id === roleID
			else return role.name === roleID
		})
}

/**
 *
 * @param {TextChannel} channel
 * @param {string} messageId
 */
async function getMessageObject(channel, messageId) {
	return (await channel.messages.fetch(messageId)) || null
}

function dmMember(member, content) {
	try {
		member.createDM().then(dm => dm.send(content))
	} catch (err) {
		console.log(err)
	}
}

/**
 * @param {ValClient} client
 * @param {string} channelId
 */
function getMemberObject(client, userId) {
	return client.guilds.cache
		.find(guild => guild.name === 'VALARIUM')
		.members.cache.find(member => member.id === userId)
}

/**
 * Recursively deep-freezes objects
 * @param {object} object object to freeze
 */
function deepFreeze(object) {
	const keys = Object.keys(object)

	for (const key of keys) {
		const value = object[key]

		if (value && typeof value === 'object') {
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
function isOneOf(matcher, possibilities) {
	for (const possibility of possibilities) {
		if (matcher === possibility) return true
	}
}

/**
 *
 * @param {*} client
 * @param {*} notification
 * @param {*} alertLevel
 */
function log(client, notification, alertLevel) {
	const statusEmoji =
		alertLevel === 'info'
			? ':grey_question:'
			: alertLevel === 'warn'
			? ':warning:'
			: ':x:'
	const shouldMention = alertLevel === 'error' || alertLevel === 'warn'
	const message =
		typeof notification === 'object'
			? `${notification.toString()}`
			: notification

	if (process.env.MODE === 'PRODUCTION') {
		if (client.ready) {
			const { CHANNEL_BOT_STATUS } = client.config.CHANNELS
			const botStatusChannel = getChannelObject(client, CHANNEL_BOT_STATUS)
			const fullNotification = `${statusEmoji} ${message} ${
				shouldMention ? '<@&639855023970451457>' : ''
			}`

			console.log(`[${alertLevel}] ${message}`)
			botStatusChannel.send(fullNotification)
		} else {
			if (typeof this.client.controllers.queue !== 'undefined')
				this.client.controllers.queue.enqueue(
					log,
					client,
					notification,
					alertLevel
				)
		}
	} else console.log(`[${alertLevel}]`, notification)
}

/**
 *
 * @param {*} client
 * @param {*} notification
 * @param {*} alertLevel
 */
async function notify(client, notification, embed, channelID) {
	// REFACTORME: refactor this mess into classes
	try {
		if (client.ready) {
			const { CHANNEL_TEST } = client.config.CHANNELS
			const notificationsChannel = getChannelObject(
				client,
				process.env.MODE === 'DEVELOPMENT' ? CHANNEL_TEST : channelID
			)

			return notificationsChannel.send(notification, { embed })
		} else {
			this.client.controllers.queue.enqueue(notify, client, notification)
		}
	} catch (err) {
		log(client, err, 'error')
	}
}

/**
 *
 * @param {*} messageContent
 */
function calculateUniqueWords(messageContent) {
	const unique = {}

	return messageContent.split(' ').filter(word => {
		if (!unique[word] && word.length >= 2) {
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
function generateEvent(client, event, content) {
	let generated = event

	Object.keys(content).forEach(variable => {
		generated = generated.replace(
			new RegExp(`{{${variable}}}`),
			content[variable]
		)
	})

	return generated
}

/**
 * returns a parsed level string
 * @param {*} securityLevel
 */
function translateSecurityLevel(securityLevel) {
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

async function awaitMessages(channel, filter, options) {
	return (await channel.awaitMessages(filter, options)).first().content
}

module.exports = {
	createEmbed,
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
	calculateUniqueWords,
	awaitMessages
}
