/**
 * @param {ValClient} client
 * @param {string} channelId
 * @returns {GuildChannel}
 */
function getChannelObject(client, channelId) {
	const { CHANNEL_TEST } = client.config.CHANNELS;
	const { MODE } = process.env;

	return client.guilds.cache
		.find(guild => guild.name === 'VALARIUM')
		.channels.cache.find(ch =>
			MODE === 'DEVELOPMENT' ? ch.id === CHANNEL_TEST : ch.id === channelId
		);
}

/**
 * @param {ValClient} client
 * @param {string} roleId name or id
 */
function getRoleObject(client, roleID) {
	return client.guilds.cache
		.find(guild => guild.name === 'VALARIUM')
		.roles.cache.find(role => {
			if (/\d+/.test(roleID)) return role.id === roleID;
			else return role.name === roleID;
		});
}

/**
 * @param {ValClient} client
 * @param {string} channelId
 */
function getMemberObject(client, userId) {
	return client.guilds.cache
		.find(guild => guild.name === 'VALARIUM')
		.members.cache.find(member => member.id === userId);
}

module.exports = {
	getMemberObject,
	getChannelObject,
	getRoleObject
};
