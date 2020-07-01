const { MODE } = process.env;

import ValClient from '../ValClient';

import { readFileSync } from 'fs';
import { resolve } from 'path';
import { Snowflake, TextChannel } from 'discord.js';

/**
 * Returns a text channel
 */
export function getChannelObject(
	client: ValClient,
	channelId: Snowflake
): TextChannel | undefined {
	const { CHANNEL_TEST } = client.config;

	return <TextChannel>(
		client.guilds.cache
			.find(guild => guild.name === 'VALARIUM')
			.channels.cache.find(
				ch =>
					ch.type === 'text' &&
					(MODE === 'DEVELOPMENT'
						? ch.id === CHANNEL_TEST
						: ch.id === channelId)
			)
	);
}

/**
 * Returns a Role object based on name or id
 */
export function getRoleObject(client: ValClient, roleID: string) {
	return client.guilds.cache
		.find(guild => guild.name === 'VALARIUM')
		.roles.cache.find(role => role.id === roleID || role.name === roleID);
}

/**
 * Returns a GuildMember object
 */
export function getMemberObject(client: ValClient, userId: Snowflake) {
	return client.guilds.cache
		.find(guild => guild.name === 'VALARIUM')
		.members.cache.find(member => member.id === userId);
}

/**
 * Parses a channel mention and returns the id
 */
export function getChannelFromMention(mention: string): string | undefined {
	const channelIdRegex = /(<#(\d+)>)|(\d+)/;
	const match = mention.match(channelIdRegex);

	return match ? match[2] || match[3] : undefined;
}

export function localToBuffer(path: string) {
	const file =
		'data:image/jpeg;base64,' +
		readFileSync(resolve(__dirname, path), {
			encoding: 'base64'
		});
	return file;
}