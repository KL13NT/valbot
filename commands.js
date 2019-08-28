const { RichEmbed } = require('discord.js')
import { getWarningsFromDatabase, enforceCommandArguments, formatMentionReason } from './utils'

const sendEmbedNotification = async function (member, embedOptions, fields, attachments, channels, callback){
  try{
    const embed = new RichEmbed(embedOptions)
    embed.setThumbnail('https://lh4.googleusercontent.com/Yic_fQ7O-bo2q1ELjzBTQaR3ljVG-coyKsj87E55QzuxrH4b0K1F2ZchjFVrQ_QBA93fc1xWczkD7LGPMTsO')
    
    if(fields.length > 0){
      fields.forEach(field => field.name==='Moderator' || field.name==='Member'? embed.addField(field.name, field.value, true): embed.addField(field.name, field.value))
    }
    
    if(attachments){
      attachments.forEach(attachment => {
        embed.attachFile(attachment.path)
      })
    }

    
    if(channels){
      channels.forEach(channel => {
        channel.send(embed)
      })
    }
    
    if(member){
      const DMChannel = await member.createDM()
      await DMChannel.send(embed)
    }

    if(callback){
      callback(embed)
    }
  }
  catch(err){ console.log(err) }
}



/**
 * 
 * @param {DiscordGuildMessage} message The original message object
 * @param {Array} rest Array resulting from splitting the message and removing [val!, commandName]
 */
const warn = async (message, rest) => {
  if(!enforceCommandArguments(message, 2, rest)) return

  const [memberMention, reason] = rest
  const memberId = memberMention.toString().replace(/<|>|@/ig, '')
  const date = new Date().toString()
  const callee = message.member

  try{
    const warnedMember = await __ENV.__VALARIUM_GUILD().fetchMember(memberId)

    const userWarnings = (await __ENV.__DATABASE_OBJECT.collection('GUILD_WARNINGS').findOneAndUpdate({ USER_ID: warnedMember.id }, {
      $push: { 
        RECORDED_WARNINGS: {
          WARNING_REASON: reason,
          WARNING_DATE: new Date().toString()
        }   
      }
    }, { upsert: true, returnOriginal: false })).value

    sendEmbedNotification(
      warnedMember, 
      { 
        description: `${warnedMember} has been warned at ${date} by ${callee}`, 
        title:`WARNING, ${warnedMember}`, 
        color: 0xfade78,
        footer: date
      }, [
        { name: 'Member', value: `${warnedMember}` }, 
        { name: 'Moderator', value: `${callee}` }, 
        { name: 'Reason', value: reason }, 
        { name: 'Status', value: `This user now has ${userWarnings.RECORDED_WARNINGS.length} warnings` }
      ], 
      [], 
      [__ENV.__MODERATION_NOTICES_CHANNEL()])

    if(userWarnings.RECORDED_WARNINGS.length === 3){
      // ban(message, args, __ENV, 'Warned 3 times')
      console.log('USER SHOULD BE BANNED')
    }
  }
  catch(err){ console.log(err) }
}


const mute = async (message, rest) => {
  try{
    if(!enforceCommandArguments(message, 2, formatMentionReason(rest))) return
    
    const [memberMention, reason] = formatMentionReason(rest)
    const memberId = memberMention.toString().replace(/<|>|@/ig, '')
    const date = new Date().toString()
    const mutedMember = await __ENV.__VALARIUM_GUILD().fetchMember(memberId)
    const slicedReason = reason || 'Violation of the rules'
        
    mutedMember.addRole('586839490102951936')
    !mutedMember.roles.some(role => role.id === '586839490102951936') ? mutedMember.addRole('586839490102951936'): message.reply('this user is already muted')

    sendEmbedNotification(
      undefined, 
      {
        author: message.author, 
        description: `${mutedMember} has been muted at ${date} by ${message.member}`, 
        title:`INFO, ${mutedMember}`, 
        color: 0xfade78,
        footer: date
      }, [
        { name: 'Member', value: `${mutedMember}` }, 
        { name: 'Moderator', value: `${message.member}` }, 
        { name: 'Reason', value: slicedReason }, 
        { name: 'Status', value: 'This user is now muted and will be automatically unmuted in 15 minutes' }
      ], 
      undefined, 
      [__ENV.__MODERATION_NOTICES_CHANNEL()])
        
    setTimeout(() => { unmute(message, args, __ENV) }, 900000) //15 minutes 900000 ms
  }
  catch(err){ console.log(err) }
}


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

const clear = async (message, rest) => {
  try{
    const count = parseInt(rest[0])

    if(!enforceCommandArguments(message, 1, rest)) return

    if(count === 0) {
      message.reply('Supplying 0 as count is a dangerous move. Please supply `n` where `n > 0`')
      return
    }
    let deletedMessages = await message.channel.bulkDelete(count)
    deletedMessages = deletedMessages.map(message => ({ author: { name: message.author.username, id: message.author.id }, content: message.content }))
    __ENV.__DATABASE_OBJECT.collection('DELETED_MESSAGES').insertMany(deletedMessages)

    message.reply(`deleted ${count} messages.`)
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

const channelExists = channelId => __ENV.__VALARIUM_GUILD().channels.find(channel => channel.id === channelId)
const roleExists = roleId => __ENV.__VALARIUM_GUILD().roles.find(role => role.id === roleId)
const messageExists = async (messageId, channel) => channel.fetchMessage(messageId)

// const isReactionRoleCommandValid = ([channelId, messageId, roleId, emoji]) => {
//   try{
//     channelExists(channelId) |> 
//   }
//   catch(err){
//     console.log(err)
//   }
// }

const reactionRoles = async (message, rest) => {
  try{
    if(!enforceCommandArguments(message, 4, rest)) return

    const [channelId, messageId, roleId, emoji] = rest
    const channel = channelExists(channelId)
    const message = await messageExists(messageId, channel)
    console.log('Initiating reactionRoles')

    if(channel){
      if(message){
        if(roleExists(roleId)){
          console.log('everything is valid')
          const role = roleExists(roleId)
          const userReactionsCollector = message.createReactionCollector(reaction => reaction._emoji.name === emoji)

          userReactionsCollector.on('collect', async reaction => {
            console.log(reaction._emoji.name === emoji)
            console.log(reaction)
            const users = await reaction.fetchUsers()

            users.forEach(async user => {
              const member = await message.guild.fetchMember(user.id)
              member.addRole(__ENV.__AVAILABLE_ROLES.find(role => role.name === role.id))
            })
          })
          __ENV.__DATABASE_OBJECT.collection('WATCHED_MESSAGES').updateOne({
            CHANNEL_ID: channelId,
            MESSAGE_ID: messageId
          },{
            $addToSet: { 
              WATCHED_REACTIONS: {
                REACTION_NAME: emoji,
                REACTION_ROLE_ID: role.id,
                REACTION_ROLE_NAME: role.name
              } 
            }
          }, { upsert: true })
        }
      }
    }
  }
  catch(err){
    console.error(err)
  }
}


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