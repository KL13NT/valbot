const Discord = require('discord.js')
const { log, getMemberObject, notify } = require('../utils/utils')
const { createModerationEmbed } = require('./EmbedUtils')

/**
 * @typedef ModerationOptions
 * @property {Discord.Snowflake} member Member ID
 * @property {Discord.Snowflake} moderator Moderator ID
 * @property {Discord.Snowflake} channel Channel ID
 * @property {string} reason Reason
 */

module.exports = class ModerationUtils {
	/**
	 *
	 * @param {Discord.Client} client
	 * @param {ModerationOptions} options
	 */
	static async mute(client, { member, moderator, channel, reason }) {
		const { ROLE_MUTED } = client.config.ROLES
		const { CHANNEL_MOD_LOGS } = client.config.CHANNELS

		const targetMember = getMemberObject(client, member)

		const embed = createModerationEmbed({
			title: 'Muted Member',
			member,
			moderator,
			channel,
			reason
		})

		try {
			await targetMember.roles.add(ROLE_MUTED)

			setTimeout(() => {
				ModerationUtils.unmute(client, {
					member,
					moderator,
					channel,
					reason: 'Mute time expired'
				})
			}, 5 * 60 * 1000)

			notify(client, '', embed, CHANNEL_MOD_LOGS)
		} catch (err) {
			log(client, err, 'error')
		}
	}

	/**
	 *
	 * @param {Discord.Client} client
	 * @param {ModerationOptions} param1
	 */
	static async ban(client, { member, moderator, channel, reason }) {
		const { CHANNEL_MOD_LOGS } = client.config.CHANNELS

		const targetMember = getMemberObject(client, member)

		const embed = createModerationEmbed({
			title: 'Banned Member',
			member,
			moderator,
			channel,
			reason
		})

		try {
			await targetMember.ban({ reason })
			notify(client, '', embed, CHANNEL_MOD_LOGS)
		} catch (err) {
			log(client, err, 'error')
		}
	}

	/**
	 *
	 * @param {Discord.Client} client
	 * @param {ModerationOptions} param1
	 */
	static async warn(client, { member, moderator, channel, reason }) {
		const { CHANNEL_MOD_LOGS } = client.config.CHANNELS
		const { ROLE_WARNED } = client.config.ROLES

		const targetMember = getMemberObject(client, member)

		const embed = createModerationEmbed({
			title: 'Warned Member',
			member,
			moderator,
			channel,
			reason
		})

		try {
			await targetMember.roles.add(ROLE_WARNED)
			notify(client, '', embed, CHANNEL_MOD_LOGS)
		} catch (err) {
			log(client, err, 'error')
		}
	}

	/**
	 *
	 * @param {Discord.Client} client
	 * @param {ModerationOptions} param1
	 */
	static async unwarn(client, { member, moderator, channel, reason }) {
		const { ROLE_WARNED } = client.config.ROLES
		const { CHANNEL_MOD_LOGS } = client.config.CHANNELS

		const targetMember = getMemberObject(client, member)

		const embed = createModerationEmbed({
			title: 'Forgave Member',
			member,
			moderator,
			channel,
			reason
		})

		try {
			await targetMember.roles.remove(ROLE_WARNED)
			notify(client, '', embed, CHANNEL_MOD_LOGS)
		} catch (err) {
			log(client, err, 'error')
		}
	}

	/**
	 *
	 * @param {Discord.Client} client
	 * @param {ModerationOptions} param1
	 */
	static async unmute(client, { member, moderator, channel, reason }) {
		const { ROLE_MUTED } = client.config.ROLES
		const { CHANNEL_MOD_LOGS } = client.config.CHANNELS

		const targetMember = getMemberObject(client, member)

		const embed = createModerationEmbed({
			title: 'Unmuted Member',
			member,
			moderator,
			channel,
			reason
		})

		try {
			await targetMember.roles.remove(ROLE_MUTED)
			notify(client, '', embed, CHANNEL_MOD_LOGS)
		} catch (err) {
			log(client, err, 'error')
		}
	}

	/**
	 *
	 * @param {Discord.Client} client
	 * @param {Discord.Snowflake} member
	 */
	static isWarned(client, member) {
		const { ROLE_WARNED } = client.config.ROLES
		const targetMember = getMemberObject(client, member)

		return targetMember.roles.cache.find(role => role.id === ROLE_WARNED)
	}

	/**
	 *
	 * @param {Discord.Client} client
	 * @param {Discord.Snowflake} member
	 */
	static isMuted(client, member) {
		const { ROLE_MUTED } = client.config.ROLES
		const targetMember = getMemberObject(client, member)

		return targetMember.roles.cache.find(role => role.id === ROLE_MUTED)
	}
}
