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
	getRoleObject
}