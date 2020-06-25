const { MessageEmbed, Snowflake } = require('discord.js');

/**
 * @typedef ModerationEmbedOptions
 * @property {string} title Title of embed
 * @property {string} reason Reason
 * @property {Date} [date]
 * @property {Snowflake} member Member ID
 * @property {Snowflake} moderator Moderator ID
 * @property {Snowflake} channel Channel ID
 */

/**
 * @typedef RoleEmbedOptions
 * @property {string} title
 * @property {Snowflake} member
 * @property {Date} [date]
 * @property {Snowflake} moderator Moderator ID
 * @property {Snowflake} channel Channel ID
 * @property {Snowflake} role Role ID
 */

/**
 * @typedef ClearEmbedOptions
 * @property {Date} [date]
 * @property {Snowflake} moderator Moderator ID
 * @property {Snowflake} channel Channel ID
 * @property {number} count Role ID
 */

/**
 * Creates a moderation (ban/mute/warn) event embed
 * @param {ModerationEmbedOptions} param0
 * @returns {MessageEmbed} embed
 */
function createUserModerationEmbed({
	title,
	member,
	moderator,
	channel,
	reason,
	date
}) {
	if (!title) throw Error('A title is required');
	if (!member) throw Error('A member ID is required');
	if (!moderator) throw Error('A moderator ID is required');
	if (!channel) throw Error('A channel ID is required');
	if (!reason) throw Error('A reason is required');

	return createEmbed({
		title: title,
		fields: [
			{
				name: '**User**',
				value: `<@${member}>`,
				inline: true
			},
			{ name: '**User ID**', value: member, inline: true },
			{ name: '**Moderator**', value: `<@${moderator}>` },
			{ name: '**Location**', value: `<#${channel}>`, inline: true },
			{ name: '**Reason**', value: reason },
			{
				name: '**Date / Time**',
				value: date ? date.toUTCString() : new Date().toUTCString(),
				inline: true
			}
		]
	});
}

/**
 * Creates a role (give/remove) event embed
 * @param {RoleEmbedOptions} param0
 * @returns {MessageEmbed} embed
 */
function createRoleEmbed({ title, member, moderator, channel, role, date }) {
	if (!title) throw Error('A title is required');
	if (!member) throw Error('A member ID is required');
	if (!moderator) throw Error('A moderator ID is required');
	if (!channel) throw Error('A channel ID is required');
	if (!role) throw Error('A role ID is required');

	return createEmbed({
		title: title,
		fields: [
			{
				name: '**User**',
				value: `<@${member}>`,
				inline: true
			},
			{ name: '**User ID**', value: member, inline: true },
			{ name: '**Moderator**', value: `<@${moderator}>` },
			{ name: '**Location**', value: `<#${channel}>`, inline: true },
			{ name: '**Role**', value: `<@&${role}>` },
			{
				name: '**Date / Time**',
				value: date ? date.toUTCString() : new Date().toUTCString(),
				inline: true
			}
		]
	});
}

/**
 * Creates an embed for levelups
 * @param {object} param0
 * @param {object} param0.milestone
 * @param {Discord.Role} param0.role
 */
function createLevelupEmbed({ milestone, role }) {
	if (!milestone) throw Error('A milestone is required');
	if (!role) throw Error('A role is required');

	return createEmbed({
		title: `Achievement Unlocked - ${milestone.name}`,
		description: `GG! You unlocked the ${milestone.name} achievement\nYou just received the ${role.name} role!`,
		footer: 'To get all available levels ask an admin/moderator.',
		timestamp: true,
		fields: [
			{ name: 'Achievement name', value: milestone.name },
			{ name: 'Achievement description', value: milestone.description }
		]
	});
}

/**
 * Create embed for clear command
 * @param {ClearEmbedOptions} param0
 */
function createClearEmbed({ moderator, channel, count, date }) {
	if (!moderator) throw Error('A moderator ID is required');
	if (!channel) throw Error('A channel ID is required');
	if (!count) throw Error('A count is required');

	return createEmbed({
		title: 'Message Purge',
		fields: [
			{ name: '**Moderator**', value: `<@${moderator}>` },
			{ name: '**Location**', value: `<#${channel}>`, inline: true },
			{
				name: '**Purged Amount**',
				value: `Purged **${count}** messages`,
				inline: true
			},
			{
				name: '**Date / Time**',
				value: date ? date.toUTCString() : new Date().toUTCString(),
				inline: true
			}
		]
	});
}

/**
 *
 * @param {MessageEmbed} options - Destructured embed options
 * @returns {MessageEmbed} embed
 */
function createEmbed({ fields, attachments, ...embedOptions }) {
	const embed = new MessageEmbed(embedOptions).setColor('#ffcc5c');

	if (fields)
		fields.forEach(field =>
			embed.addField(field.name, field.value, field.inline)
		);

	if (attachments)
		attachments.forEach(attachment => embed.attachFile(attachment.path));

	return embed;
}

module.exports = {
	createEmbed,
	createRoleEmbed,
	createClearEmbed,
	createLevelupEmbed,
	createUserModerationEmbed
};
