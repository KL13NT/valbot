const Discord = require('discord.js')
const { createEmbed } = require('../utils/utils')

/**
 * @typedef EmbedOptions
 * @property {string} title Title of embed
 * @property {string} reason Reason
 * @property {Discord.Snowflake} member Member ID
 * @property {Discord.Snowflake} moderator Moderator ID
 * @property {Discord.Snowflake} channel Channel ID
 */

module.exports = class EmbedUtils {
	static createModerationEmbed({ title, member, moderator, channel, reason }) {
		return createEmbed({
			title: title,
			fields: [
				{
					name: '**User**',
					value: ` <@${member}>`,
					inline: true
				},
				{ name: '**User ID**', value: `${member}`, inline: true },
				{ name: '**Moderator**', value: `<@${moderator}>` },
				{ name: '**Location**', value: `<#${channel}>`, inline: true },
				{
					name: '**Date / Time**',
					value: `${new Date().toUTCString()}`,
					inline: true
				},
				{ name: '**Reason**', value: reason }
			]
		})
	}
}
