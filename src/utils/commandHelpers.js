const { deepFreeze, getChannelObject } = require('./utils')


async function mute (message){
	const { IMPORTANT_ROLES, IMPORTANT_CHANNELS } = process

	message.member.addRole(IMPORTANT_ROLES.muted)

	const muted = {
		time: new Date().getTime(),
		id: message.member.id
	}

	process.MUTED_MEMBERS = { ...this.mutedMembers, id: muted }
	deepFreeze(process.MUTED_MEMBERS)
}

/**
 *
 * @param {ValClient} client
 * @param {ValClient} notificationText
 */
async function notify (client, notificationText){
	const { IMPORTANT_CHANNELS } = process

	getChannelObject(client, IMPORTANT_CHANNELS.notifications).send(notificationText)
}
