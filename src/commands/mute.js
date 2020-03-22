const { Command } = require(`../structures/Command`)
// import { enforceCommandArguments, formatMentionReason } from '../utils/utils'
// import { unmute } from './unmute'
// import { sendEmbedNotification } from './unmute'

class Mute extends Command {
  constructor (client){
    const commandOptions = {
      name: `mute`,
			cooldown: 10 * 1000,
			nOfParams: 2,
			requiredAuthLevel: 2,
			description: `بتمنع الشخص انه يتكلم فويس او تيكست لمدة 15 دقيقة`,
			exampleUsage: `val! mute @Sovereign Violation of rules`,
			extraParams: true
    }
    super(client, commandOptions)

	}

	_run(context){

	}
}


module.exports = Mute
// export const mute = async (message, rest) => {
//   try{
//     if(!enforceCommandArguments(message, 2, formatMentionReason(rest))) return

//     const [memberMention, reason] = formatMentionReason(rest)
//     const memberId = memberMention.toString().replace(/<|>|@/ig, ``)
//     const date = new Date().toString()
//     const mutedMember = await __ENV.__VALARIUM_GUILD().fetchMember(memberId)
//     const slicedReason = reason || `Violation of the rules`

//     mutedMember.addRole(`586839490102951936`)
//     !mutedMember.roles.some(role => role.id === `586839490102951936`) ? mutedMember.addRole(`586839490102951936`): message.reply(`this user is already muted`)

//     sendEmbedNotification(
//       undefined,
//       {
//         author: message.author,
//         description: `${mutedMember} has been muted at ${date} by ${message.member}`,
//         title:`INFO, ${mutedMember}`,
//         color: 0xfade78,
//         footer: date
//       }, [
//         { name: `Member`, value: `${mutedMember}` },
//         { name: `Moderator`, value: `${message.member}` },
//         { name: `Reason`, value: slicedReason },
//         { name: `Status`, value: `This user is now muted and will be automatically unmuted in 15 minutes` }
//       ],
//       undefined,
//       [__ENV.__MODERATION_NOTICES_CHANNEL()])

//     setTimeout(() => { unmute(message, args, __ENV) }, 900000) //15 minutes 900000 ms
//   }
//   catch(err){ console.log(err) }
// }