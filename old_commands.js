/* eslint-disable quotes */
/* eslint-disable no-undef */
/* eslint-disable array-bracket-spacing */
/* eslint-disable indent */
import { getWarningsFromDatabase, enforceCommandArguments, formatMentionReason } from './utils'








const unmute = async (message, rest) => {
  try{
    console.log('calling unmute!', message.content, rest)
    if(!enforceCommandArguments(message, 1, formatMentionReason(rest))) return

    const [memberId] = formatMentionReason(rest)
    const mutedMember = await __ENV.__VALARIUM_GUILD().fetchMember(memberId)
    const date = new Date().toString()
    
    mutedMember.roles.some(role => role.id === '586839490102951936')? mutedMember.removeRole('586839490102951936'): message.reply('this user is not muted')
        
    sendEmbedNotification(
      undefined, 
      {
        author: message.author, 
        description: `${mutedMember} has been unmuted at ${date} by ${message.member}`, 
        title:`INFO, ${mutedMember}`, 
        color: 0xfade78,
        footer: date
      }, [
        { name: 'Member', value: `${mutedMember}` }, 
        { name: 'Moderator', value: `${message.member}` }, 
        { name: 'Status', value: 'This user is now unmuted. Happy talking!' }
      ], 
      undefined, 
      [__ENV.__MODERATION_NOTICES_CHANNEL()])
  }
  catch(err){ console.log(err) }
}



const dmAllMembers = async (message, rest) => {
  try{
    __ENV.__VALARIUM_GUILD().members.forEach(async member => {
      const memberDM = await member.createDM()
      memberDM.send(rest)
    })
  }
  catch(err){
    console.log(err)
  }
}

//TODO: SEE NO REASON TO USE THIS FUNCTION AT ALL
// const warnings = async (message, args, __ENV) => {
//   try{
//     const warnedMember = await __ENV.__VALARIUM_GUILD().fetchMember(args[3].toString().replace(/<|>|@/ig, ''))
//     const userWarnings = await getWarningsFromDatabase(warnedMember, __ENV)
//     let fields = []

//     if(userWarnings && userWarnings.RECORDED_WARNINGS){
//       fields = userWarnings.RECORDED_WARNINGS.map(( warning => ({ name: warning.WARNING_REASON_NAME, value:
//             warning.WARNING_REASON_DESCRIPTION })))
//     }
        
//     sendEmbedNotification(
//       __ENV, undefined,
//       {
//         author: message.author,  
//         title:`WARNING LOG, ${warnedMember}`, 
//         color: 0xfade78
//       }, [
//         ...fields,
//         { name: 'Member', value: `${warnedMember}` }, 
//         { name: 'Moderator', value: `${message.member}` }, 
//         { name: 'Status', value: `This user has ${fields.length} warnings` }
//       ], 
//       undefined, 
//       undefined, 
//       (embed) => { message.reply(embed) }
//     )
//   }
//   catch(err){ console.log(err) }
// }

// const isReactionRoleCommandValid = ([channelId, messageId, roleId, emoji]) => {
//   try{
//     channelExists(channelId) |> 
//   }
//   catch(err){
//     console.log(err)
//   }
// }




const ban = async function (message, args, __ENV, reason){
  try{
    const bannedMember = await __ENV.__VALARIUM_GUILD().fetchMember(args[3].toString().replace(/<|>|@/ig, ''))
    const userWarnings = warnings(message, args, __ENV)
    const date = new Date().toString()

    bannedMember.ban({ days: 3, reason })
        
    sendEmbedNotification(__ENV, bannedMember, 
      {
        author: message.author, 
        description: `${bannedMember} has been warned at ${date} by ${message.member}`, 
        title:`BAN, ${bannedMember}`, 
        color: 0xfade78,
        footer: date
      }, [
        { name: 'Member', value: `${bannedMember}` }, 
        { name: 'Moderator', value: `${message.member}` }, 
        { name: 'Reason', value: reason }, 
        { name: 'Status', value: userWarnings.RECORDED_WARNINGS.length === 3? 'This user is now banned': `This user now has ${userWarnings.RECORDED_WARNINGS.length} warnings` }
      ], )
  }
  catch(err){ console.log(err) }
}


const unban = async function (message, args, __ENV, reason){
  try{
    const bannedMember = await __ENV.__VALARIUM_CLIENT.fetchUser(args[3].toString().replace(/<|>|@/ig, ''), { cache: true })

    await __ENV.__VALARIUM_GUILD().unban(bannedMember, reason)

    sendEmbedNotification(__ENV, bannedMember, { 
      author: 'VALARIUM', description: 'You\'ve been unbanned from Valarium. Enjoy your stay :tada::hugging:!', title:'NOTIFICATION FROM VALARIUM', color: 0xfade78
    }, [{ name: 'Mod: ', value: message.author }])
  }
  catch(err){ console.log(err) }
}


const reply = async function (messageToReply, replyMessage){
  await messageToReply.reply(replyMessage)
}

const commands = {
  sendEmbedNotification,
  warn, 
  // warnings,
  mute,
  unmute,
  dmAllMembers,
  clear,
  reactionRoles,
  ban,
  unban,
  getWarningsFromDatabase,
  reply
}

export default commands