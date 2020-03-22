const { RichEmbed } = require('discord.js')
const { ERROR_COMMANDS_REQUIRE_2_PARAMS } = require('../config/events.json')



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
 * Reacts with a given array of reactions to a message
 * @param {Message} message
 * @param {string} reactions
 */
function react (message, reactions = []){
	reactions.forEach(reaction => message.react(reaction).catch(err => console.log(err)))
}


/**
 *
 * @param {Message} message - message
 * @param {EmbedOptions} options - Destructured object
 */
async function sendEmbed (message, { member, embedOptions, fields, attachments, channels, reactions = [], callback }) {
	try{
		const embed = new RichEmbed(embedOptions)
		embed.setThumbnail('https://github.com/KL13NT/valbot/raw/development/src/media/valarium-bot-prod.png')

		if(fields)
			fields.forEach(field =>
				field.inline || field.name === 'Moderator' || field.name === 'Member'
					? embed.addField(field.name, field.value, true)
					: embed.addField(field.name, field.value))

		if(attachments) attachments.forEach(attachment => embed.attachFile(attachment.path))
		if(channels) channels.forEach(channel => channel.send(embed).then(sent => react(sent, reactions)))

		if(member){
			const DMChannel = await member.createDM()
			DMChannel.send(embed).then(sent => react(sent, reactions))
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
 * @returns {GuildChannel}
 */
function getChannelObject (client, channelId){
	const isDevelopment = process.env.MODE === 'DEVELOPMENT'
	const testChannelId = process.IMPORTANT_CHANNELS.test

	return client.guilds
		.find(guild => guild.name === 'VALARIUM').channels
		.find(ch => isDevelopment? ch.id === testChannelId: ch.id === channelId)
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

/**
 * Returns whether an element is in a set of elements
 * @param {*} matcher element to check
 * @param {array} possibilities possibilities
 */
function isOneOf (matcher, possibilities){
	for(const possibility of possibilities){
		if(matcher === possibility) return true
	}
}



module.exports = {
	sendEmbed,
	getChannelObject,
	deepFreeze,
	getRoleObject,
	setupConfig
}