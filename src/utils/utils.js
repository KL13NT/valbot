const { getChannelObject } = require('./DiscordObjectUtils')

/**
 *
 * @param {Discord.Client} client
 * @param {string|Error} notification
 * @param {string} alertLevel
 * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/toString#Description
 */
async function log(client, notification, alertLevel) {
	console.log(`[${alertLevel}]`, notification) // need console regardless

	if (process.env.MODE !== 'PRODUCTION') return
	if (!client.ready) return client.controllers.queue.enqueue(log, ...arguments)

	const { CHANNEL_BOT_STATUS } = client.config.CHANNELS

	const channel = getChannelObject(client, CHANNEL_BOT_STATUS)
	const message = getMessage(String(notification), alertLevel) // @see

	channel.send(message)
}

function getAlertStatus(alertLevel) {
	if (alertLevel === 'info') return ':grey_question:'
	if (alertLevel === 'warn') return ':warning:'
	if (alertLevel === 'error') return ':x:'
}

function getMessage(message, alertLevel) {
	const statusEmoji = getAlertStatus(alertLevel)
	const notification = `[${statusEmoji}] ${message}`

	if (alertLevel === 'error' || alertLevel === 'warn')
		return `${notification} <@&639855023970451457>`
	else return notification
}

/**
 *
 * @param {*} client
 * @param {*} notification
 * @param {*} alertLevel
 */
async function notify(client, notification, embed, channelID) {
	if (!client.ready)
		return client.controllers.queue.enqueue(notify, ...arguments)

	const { CHANNEL_NOTIFICATIONS } = client.config.CHANNELS

	const channel = getChannelObject(client, channelID || CHANNEL_NOTIFICATIONS)

	return channel.send(notification, { embed })
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
	log,
	notify,
	calculateUniqueWords
}
