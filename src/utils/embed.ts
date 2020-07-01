import {
	ModerationEmbedOptions,
	RoleEmbedOptions,
	LevelupEmbedOptions,
	ClearEmbedOptions
} from '../types/interfaces';
import { MessageEmbed, MessageEmbedOptions } from 'discord.js';

/**
 * Creates a moderation (ban/mute/warn) event embed
 */
export function createUserModerationEmbed({
	title,
	member,
	moderator,
	channel,
	reason,
	date
}: ModerationEmbedOptions) {
	return createEmbed({
		title: title,
		fields: [
			{
				name: '**User**',
				value: `<@${member}>`,
				inline: true
			},
			{ name: '**User ID**', value: member, inline: true },
			{ name: '**Moderator**', value: `<@${moderator}>`, inline: false },
			{ name: '**Location**', value: `<#${channel}>`, inline: true },
			{ name: '**Reason**', value: reason, inline: false },
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
 */
export function createRoleEmbed({
	title,
	member,
	moderator,
	channel,
	role,
	date
}: RoleEmbedOptions) {
	return createEmbed({
		title: title,
		fields: [
			{
				name: '**User**',
				value: `<@${member}>`,
				inline: true
			},
			{ name: '**User ID**', value: member, inline: true },
			{ name: '**Moderator**', value: `<@${moderator}>`, inline: false },
			{ name: '**Location**', value: `<#${channel}>`, inline: true },
			{ name: '**Role**', value: `<@&${role}>`, inline: false },
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
 */
export function createLevelupEmbed({ milestone, role }: LevelupEmbedOptions) {
	return createEmbed({
		title: `Achievement Unlocked - ${milestone.name}`,
		description: `GG! You unlocked the ${milestone.name} achievement\nYou just received the ${role.name} role!`,
		fields: [
			{ name: 'Achievement name', value: milestone.name, inline: false },
			{
				name: 'Achievement description',
				value: milestone.description,
				inline: false
			}
		]
	}).setFooter('To get all available levels ask an admin/moderator.');
}

/**
 * Create embed for clear command
 */
export function createClearEmbed({
	moderator,
	channel,
	count,
	date
}: ClearEmbedOptions) {
	return createEmbed({
		title: 'Message Purge',
		fields: [
			{ name: '**Moderator**', value: `<@${moderator}>`, inline: false },
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
 * Creates a general embed
 */
export function createEmbed(embedOptions: MessageEmbedOptions) {
	const embed = new MessageEmbed(embedOptions)
		.setColor('#ffcc5c')
		.setTimestamp();

	return embed;
}
