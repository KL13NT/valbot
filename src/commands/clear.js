const { Command } = require("../structures")
const { CommandOptions } = require("../structures")
const { log, getMemberObject, notify, createEmbed } = require('../utils/utils')

class Clear extends Command {
	/**
	 * Constructs help command
	 * @param {ValClient} client
	 */
  constructor(client) {
		const options = new CommandOptions({
			name: `clear`,
			cooldown: 1000,
			nOfParams: 1,
			requiredRole: 'mod',
			description: `بتمسح رسايل بعدد n`,
			exampleUsage: `5`,
			extraParams: false
		})

		super(client, options)
  }

  async _run(context) {
		const { message, member, params, channel } = context
		const numbersRegex = /\d+/

		if(numbersRegex.test(params[0])){
			const count = parseInt(params[0])

			if(count === 0) {
				return message.reply('لما تكتب صفر للكوماند دي هتخلي ديسكورد يمسح كل الرسايل اللي ف التشانل! جرب رقم تاني')
			}

			const embed = createEmbed({
				title: 'Message Purge',
				fields: [
					{ name: '**Moderator**', value: `<@${member.id}> | ${member.id}`, inline: true },
					{ name: '**Purged Amount**', value: `Purged **${count}** messages`, inline: true },
					{ name: '**Location**', value: `<#${channel.id}>` },
					{ name: '**Date / Time**', value: `${new Date().toUTCString()}`, inline: true },
				]
			})

			try{
				await channel.bulkDelete(count + 1)

				await message.reply(`مسحت ${count} يرايق.`).then(sent => {
					setTimeout(()=>{
						sent.delete()
					}, 3 * 1000)
				})

				notify(this.client, ``, embed, 'mod-logs')
			}
			catch(err){
				log(this.client, err, 'error')
			}


		}
		else return message.reply(`لازم تدخل رقم كـتالت باراميتير للكوماند دي`)
	}

}

module.exports = Clear