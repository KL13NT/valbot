const { Command, CommandOptions } = require(`../structures`)
const { log, getMemberObject, notify, createEmbed } = require('../utils/utils')
const { muted } = require('../config/important-roles.json')


class Mute extends Command {
  constructor (client){
    const commandOptions = new CommandOptions({
      name: `mute`,
			cooldown: 1000,
			nOfParams: 2,
			requiredRole: 'mod',
			description: `بتمنع الشخص انه يتكلم فويس او تيكست لمدة 5 دقايق`,
			exampleUsage: `mute <user_mention> <reason>`,
			extraParams: true,
			optionalParams: 0
    })
    super(client, commandOptions)
	}

	async _run({member, message, channel, params}){
		const [mention, ...reasonWords] = params
		const mentionRegex = /<@!(\d+)>/

		if(!mentionRegex.test(mention)) return message.reply('لازم تعمل منشن للـ member')

		const id = mention.match(mentionRegex)[1]
		const reason = reasonWords.join(' ')
		const targetMember = getMemberObject(this.client, id)

		const embed = createEmbed({
			title: 'Muted User',
			fields: [
				{ name: '**User**', value: `${mention} | ${id}` },
				{ name: '**Moderator**', value: `<@${member.id}> | ${id}` },
				{ name: '**Location**', value: `<#${channel.id}>`, inline: true },
				{ name: '**Date / Time**', value: `${new Date().toUTCString()}`, inline: true },
				{ name: '**Reason**', value: reason },
			]
		})

		try{
			await targetMember.roles.add(muted)
			setTimeout(()=>{
				targetMember.roles.remove(muted)
			}, 5 * 60 * 1000)

			notify(this.client, ``, embed, 'mod-logs')
		}
		catch(err){
			log(this.client, err, 'error')
		}
	}
}


module.exports = Mute