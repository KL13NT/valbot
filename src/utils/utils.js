const { RichEmbed } = require('discord.js')



/**
 * @typedef {object} EmbedOptions
 * @property {GuildMember} member
 * @property {object} embedOptions
 * @property {object[]} fields
 * @property {object[]} attachments
 * @property {GuildChannel[]} channels
 * @property {function} callback
 */


async function warn (message){
	message.member.addRole()
}

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

async function notify (notificationText){
	const { IMPORTANT_CHANNELS } = process

	this.guilds.find(guild => guild.name === 'VALARIUM')
		.channels.find(ch => ch.id === IMPORTANT_CHANNELS.notifications)
		.send(notificationText)
}

/**
 * Loads configuration/global objects instead of storing them on ValClient
 */
function setupConfig (){
	process.CUSTOM_PRESENCES = require('../config/custom-presences.json')
	process.IMPORTANT_CHANNELS = require('../config/important-channels.json')
	process.IMPORTANT_ROLES = require('../config/important-roles.json')
	process.AUTH_LEVELS = require('../config/auth-levels.json')
	process.MUTED_MEMBERS = {}
	process.WARNED_MEMBERS = {}

	deepFreeze(process.CUSTOM_PRESENCES)
	deepFreeze(process.IMPORTANT_CHANNELS)
	deepFreeze(process.IMPORTANT_ROLES)
	deepFreeze(process.AUTH_LEVELS)
	deepFreeze(process.MUTED_MEMBERS)
	deepFreeze(process.WARNED_MEMBERS)
}



/**
 *
 * @param {Message} message - message
 * @param {EmbedOptions} options - Destructured object
 */
async function sendEmbed (message, { member, embedOptions, fields, attachments, channels, callback }) {
	try{
		const embed = new RichEmbed(embedOptions)
		embed.setThumbnail('https://raw.githubusercontent.com/KL13NT/valbot/cab70d78f01ad7b08c6b57ebb1494d3e30da798e/botlogo.png?token=AE6X4CRRM6XC2WQMSVJESSS6L52YM')

		if(fields)
			fields.forEach(field =>
				field.name === 'Moderator' || field.name === 'Member'
					? embed.addField(field.name, field.value, true)
					: embed.addField(field.name, field.value))

		if(attachments) attachments.forEach(attachment => embed.attachFile(attachment.path))
		if(channels) channels.forEach(channel => channel.send(embed))


		if(member){
			const DMChannel = await member.createDM()
			DMChannel.send(embed)
		}

		if(callback) callback(embed)
	}
	catch(err){
		console.log(err)
		message.reply('في حاجة غلط حصلت. جرب تاني بعدين او بص ف اللوجز لو انت ديف')
	}
}


/**
 * @param {ValClient} client
 * @param {string} channelId
 */
function getChannelObject (client, channelId){
	return client.guilds
		.find(guild => guild.name === 'VALARIUM').channels
		.find(ch => ch.id === channelId)
}


/**
 * @param {ValClient} client
 * @param {string} channelId
 */
function getRoleObject (client, roleId){
	return client.guilds
		.find(guild => guild.name === 'VALARIUM').roles
		.find(role => role.id === roleId)
}


/**
 * Recursively deep-freezes objects
 * @param {object} object object to freeze
 */
function deepFreeze (object) {
	const keys = Object.keys(object)

	for (const key of keys) {
		const value = object[key]

		if(value && typeof value === 'object') {
			deepFreeze(value)
		}
	}

	return Object.freeze(object)
}



module.exports = {
	sendEmbed,
	getChannelObject,
	deepFreeze,
	getRoleObject,
	setupConfig
}