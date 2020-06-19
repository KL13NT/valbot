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

/**
 * @param {ValClient} client
 * @param {string} channelId
 */
function getMemberObject(client, userId) {
	return client.guilds.cache
		.find(guild => guild.name === 'VALARIUM')
		.members.cache.find(member => member.id === userId)
}

module.exports = {
	getMemberObject,
	getChannelObject,
	getMessageObject,
	getRoleObject
}