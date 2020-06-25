const { MODE } = process.env;

import { Snowflake } from 'discord.js';
import ValClient from '../ValClient';

/**
 * Returns a GuildChannel object
 */
export function getChannelObject(client: ValClient, channelId: Snowflake) {
	const { CHANNEL_TEST } = client.config.CHANNELS;

	return client.guilds.cache
		.find(guild => guild.name === 'VALARIUM')
		.channels.cache.find(ch =>
			MODE === 'DEVELOPMENT' ? ch.id === CHANNEL_TEST : ch.id === channelId
		);
}

/**
 * Returns a Role object
 */
export function getRoleObject(client: ValClient, roleID: Snowflake) {
	return client.guilds.cache
		.find(guild => guild.name === 'VALARIUM')
		.roles.cache.find(role => {
			if (/\d+/.test(roleID)) return role.id === roleID;
			else return role.name === roleID;
		});
}

/**
 * Returns a GuildMember object
 */
export function getMemberObject(client: ValClient, userId: Snowflake) {
	return client.guilds.cache
		.find(guild => guild.name === 'VALARIUM')
		.members.cache.find(member => member.id === userId);
}
