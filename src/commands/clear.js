const { Command } = require('../structures')
const { CommandOptions } = require('../structures')
const { log, getMemberObject, notify } = require('../utils/utils')
const { createClearEmbed } = require('../utils/EmbedUtils')

class Clear extends Command {
	/**
	 * Constructs help command
	 * @param {ValClient} client
	 */
	constructor(client) {
		const options = new CommandOptions({
			name: `clear`,
			category: 'Moderation',
			cooldown: 1000,
			nOfParams: 1,
			description: `بتمسح رسايل بعدد n`,
			exampleUsage: `5`,
			extraParams: false,
			auth: {
				method: 'ROLE',
				required: 'AUTH_MOD'
			}
		})

		super(client, options)
	}

	async _run(context) {
		const { CHANNEL_MOD_LOGS } = this.client.config.CHANNELS
		const { message, member, params, channel } = context

		const numbersRegex = /\d+/
		const count = parseInt(params[0])

		if (isNaN(count)) return message.reply('لازم تدخل رقم')
		if (count === 0) return message.reply('هنهزر ولا ايه؟')

		const embed = createClearEmbed({
			moderator: member.id,
			channel: channel.id,
			count
		})

		try {
			await channel.bulkDelete(count + 1)

			await message.reply(`مسحت ${count} يرايق.`).then(sent => {
				setTimeout(() => {
					sent.delete()
				}, 3 * 1000)
			})

			notify(this.client, ``, embed, CHANNEL_MOD_LOGS)
		} catch (err) {
			log(this.client, err, 'error')
		}
	}
}

module.exports = Clear
