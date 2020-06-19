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

function dmMember(member, content) {
	member.createDM().then(dm => dm.send(content))
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
			if (typeof client.controllers.queue !== 'undefined')
				client.controllers.queue.enqueue(log, client, notification, alertLevel)
		}
	} else console.log(`[${alertLevel}]`, notification)
}

function logError(client, error) {}

/**
 *
 * @param {*} client
 * @param {*} notification
 * @param {*} alertLevel
 */
async function notify(client, notification, embed, channelID) {
	try {
		if (client.ready) {
			const { CHANNEL_TEST, CHANNEL_NOTIFICATIONS } = client.config.CHANNELS
			const notificationsChannel = getChannelObject(
				client,
				process.env.MODE === 'DEVELOPMENT'
					? CHANNEL_TEST
					: channelID || CHANNEL_NOTIFICATIONS
			)

			return notificationsChannel.send(notification, { embed })
		} else {
			client.controllers.queue.enqueue(notify, client, notification)
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

module.exports = {
	dmMember,
	log,
	notify,
	calculateUniqueWords
}
