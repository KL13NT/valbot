//commands! 
const { RichEmbed } = require('discord.js')

let commands =  {
  org: {
    mute: async (commandMessage, args, __ENV)=>{
      try{
        let mutedMember = await __ENV.__VALARIUM_GUILD().fetchMember(args[3].toString().replace(/<|>|@/ig, ''))
        let slicedReason = args.slice(5).join(' ') || 'Violation of the rules'
        let date = new Date().toString()
        
        mutedMember.addRole('586839490102951936', args[4])
        console.log(mutedMember.roles.some(role => role.id === '586839490102951936'))
        !mutedMember.roles.some(role => role.id === '586839490102951936') ? mutedMember.addRole('586839490102951936'): commandMessage.reply('This user is already muted')

        commands.helpers.sendEmbedNotification(
          __ENV, undefined, 
          {
            author: commandMessage.author, 
            description: `${mutedMember} has been muted at ${date} by ${commandMessage.member}`, 
            title:`INFO, ${mutedMember}`, 
            color: 0xfade78,
            footer: date
          }, [
            {name: 'Member', value: `${mutedMember}`}, 
            {name: 'Moderator', value: `${commandMessage.member}`}, 
            {name: 'Reason', value: slicedReason}, 
            {name: 'Status', value: `This user is now muted and will be automatically unmuted in 15 minutes`}
          ], 
          undefined, 
          [__ENV.__MODERATION_NOTICES_CHANNEL()])
        
        setTimeout(()=>{commands.org.unmute(commandMessage, args, __ENV)}, 900000) //15 minutes 900000 ms
      }
      catch(err){console.log(err)}
    },
    unmute: async (commandMessage, args, __ENV)=>{
      try{
        let mutedMember = await __ENV.__VALARIUM_GUILD().fetchMember(args[3].toString().replace(/<|>|@/ig, ''))
        let date = new Date().toString()
        console.log(mutedMember.roles.some(role => role.id === '586839490102951936'))
        mutedMember.roles.some(role => role.id === '586839490102951936')? mutedMember.removeRole('586839490102951936'): commandMessage.reply('This user is not muted')
        
        commands.helpers.sendEmbedNotification(
          __ENV, undefined, 
          {
            author: commandMessage.author, 
            description: `${mutedMember} has been unmuted at ${date} by ${commandMessage.member}`, 
            title:`INFO, ${mutedMember}`, 
            color: 0xfade78,
            footer: date
          }, [
            {name: 'Member', value: `${mutedMember}`}, 
            {name: 'Moderator', value: `${commandMessage.member}`}, 
            {name: 'Status', value: `This user is now unmuted. Happy talking!`}
          ], 
          undefined, 
          [__ENV.__MODERATION_NOTICES_CHANNEL()])
      }
      catch(err){console.log(err)}
    }
  },
  mod: {
    allowedRoles: [
      '571716246660448318', //President
      '571705643073929226', //Leaders
    ],
    clear: async (commandMessage, args, __ENV)=>{
      try{
        let deletedMessages = await commandMessage.channel.bulkDelete(args[3]? parseInt(args[3]): 5)
        deletedMessages = deletedMessages.map(message=>({author: {name: message.author.username, id: message.author.id}, content: message.content}))
        await __ENV.__DATABASE_OBJECT.collection('DELETED_MESSAGES').insertMany(deletedMessages)
      }
      catch(err){
        console.log(err)
      }
    },
    warn: async (commandMessage, args, __ENV)=>{
      try{
        let warnedMember = await __ENV.__VALARIUM_GUILD().fetchMember(args[3].toString().replace(/<|>|@/ig, ''))
        let slicedReason = args.slice(5).join(' ')

        let userWarnings = (await __ENV.__DATABASE_OBJECT.collection('warnings').findOneAndUpdate({USER_ID: warnedMember.id}, {
          '$push': { 
            RECORDED_WARNINGS: {
              WARNING_REASON_NAME: args[4],
              WARNING_REASON_DESCRIPTION: slicedReason,
              WARNING_DATE: new Date().toString()
            }   
          }
        }, {upsert: true, returnOriginal: false})).value

        let date = new Date().toString()
        
        commands.helpers.sendEmbedNotification(
          __ENV, warnedMember, 
          {
            author: commandMessage.author, 
            description: `${warnedMember} has been warned at ${date} by ${commandMessage.member}`, 
            title:`WARNING, ${warnedMember}`, 
            color: 0xfade78,
            footer: date
          }, [
            {name: 'Member', value: `${warnedMember}`}, 
            {name: 'Moderator', value: `${commandMessage.member}`}, 
            {name: 'Reason', value: slicedReason}, 
            {name: 'Status', value: `This user now has ${userWarnings.RECORDED_WARNINGS.length} warnings`}
          ], 
          [], 
          [__ENV.__MODERATION_NOTICES_CHANNEL()])

        if(userWarnings.RECORDED_WARNINGS.length === 3){
          commands.mod.ban(commandMessage, args, __ENV, 'Warned 3 times')
        }
      }
      catch(err){console.log(err)}
    },
    warnings: async (commandMessage, args, __ENV)=>{
      try{
        let warnedMember = await __ENV.__VALARIUM_GUILD().fetchMember(args[3].toString().replace(/<|>|@/ig, ''))
        let userWarnings = await commands.helpers.getWarnings(warnedMember, __ENV)
        let fields = []

        console.log(userWarnings)
        if(userWarnings && userWarnings.RECORDED_WARNINGS){
          fields = userWarnings.RECORDED_WARNINGS.map(( warning => ({name: warning.WARNING_REASON_NAME, value:
            warning.WARNING_REASON_DESCRIPTION})))
        }
        
        commands.helpers.sendEmbedNotification(
          __ENV, undefined,
          {
            author: commandMessage.author,  
            title:`WARNING LOG, ${warnedMember}`, 
            color: 0xfade78
          }, [
            ...fields,
            {name: 'Member', value: `${warnedMember}`}, 
            {name: 'Moderator', value: `${commandMessage.member}`}, 
            {name: 'Status', value: `This user has ${userWarnings.RECORDED_WARNINGS.length} warnings`}
          ], 
          undefined, 
          [commandMessage.channel])
      }
      catch(err){console.log(err)}
    },
    reactionRoles: (commandMessage, args, __ENV)=>{
      try{
        commandMessage.guild.channels.find(ch => `<#${ch.id}>` === args[3]).fetchMessage(args[4]).then(reactionMessage=>{
          let index = 0 
          let expectedReaction = {}
          let botMessage
          let originalCommand = commandMessage.content.toString()

          const inputCollector = commandMessage.createReactionCollector(reaction => reaction)
          commandMessage.reply('Please react to the previous message with the reaction you want!')
            .then(sent=>botMessage=sent)
            .catch(console.error)

          inputCollector.on('collect', async reaction=>{
            expectedReaction.name = reaction.emoji.name
            botMessage.edit('What\'s the expected role for that reaction? Update your message to reflect that!')

            __ENV.__VALARIUM_CLIENT.on('messageUpdate', (oldMessage, newMessage)=>{
              if(oldMessage.content === originalCommand){
                if(__ENV.__AVAILABLE_ROLES.find(role => role.name === newMessage.content)){
                  reactionMessage.react(reaction.emoji.name)
                  botMessage.edit('Successful. Awaiting reactions.')
                  expectedReaction.role = newMessage.content
                  const userReactionsCollector = reactionMessage.createReactionCollector(reaction=>reaction.emoji.name === expectedReaction.name)
                  __ENV.__DATABASE_OBJECT.collection('WATCHED_MESSAGES').updateOne({
                    CHANNEL_ID: reactionMessage.channel.id,
                    MESSAGE_ID: reactionMessage.id
                  },{
                    '$addToSet': { 
                      WATCHED_REACTIONS: {
                        REACTION_NAME: reaction.emoji.name,
                        REACTION_ROLE_ID: __ENV.__AVAILABLE_ROLES.find(role => role.name === newMessage.content).id,
                        REACTION_ROLE_NAME: newMessage.content
                      } 
                    }
                  }, {upsert: true})
                  userReactionsCollector.on('collect', reaction=>{
                    reaction.fetchUsers()
                      .then(users=>{
                        users.forEach(user=>{
                          reactionMessage.guild.fetchMember(user.id)
                            .then(member=>{
                              let currentRole = __ENV.__AVAILABLE_ROLES.find(role => role.name === newMessage.content)
                              member.addRole(currentRole.id)
                              commands.notifications.DMUser(member, `You've been granted role [${currentRole.name}]`)
                              //TODO: LOAD AND COLLECT MESSAGES UPON FETCH FROM DATABASE
                            })
                        })
                      })
                  })
                }
                else{
                  commandMessage.reply('that role was not found')
                }
              }
            })
          })
        })
      }
      catch(err){
        console.error(err)
      }
    },
    ban: async function(commandMessage, args, __ENV, reason){
      try{
        let bannedMember = await __ENV.__VALARIUM_GUILD().fetchMember(args[3].toString().replace(/<|>|@/ig, ''))
        let userWarnings = commands.mod.warnings(commandMessage, args, __ENV)
        let date = new Date().toString()

        bannedMember.ban({days: 3, reason})
        
        commands.helpers.sendEmbedNotification(__ENV, bannedMember, 
          {
            author: commandMessage.author, 
            description: `${bannedMember} has been warned at ${date} by ${commandMessage.member}`, 
            title:`BAN, ${bannedMember}`, 
            color: 0xfade78,
            footer: date
          }, [
            {name: 'Member', value: `${bannedMember}`}, 
            {name: 'Moderator', value: `${commandMessage.member}`}, 
            {name: 'Reason', value: reason}, 
            {name: 'Status', value: userWarnings.RECORDED_WARNINGS.length === 3? 'This user is now banned': `This user now has ${userWarnings.RECORDED_WARNINGS.length} warnings`}
          ], )
      }
      catch(err){ console.log(err) }
    },
    unban: async function(commandMessage, args, __ENV, reason){
      try{
        let bannedMember = await __ENV.__VALARIUM_CLIENT.fetchUser(args[3].toString().replace(/<|>|@/ig, ''), {cache: true})

        await __ENV.__VALARIUM_GUILD().unban(bannedMember, reason)

        commands.helpers.sendEmbedNotification(__ENV, bannedMember, { 
          author: 'VALARIUM', description: 'You\'ve been unbanned from Valarium. Enjoy your stay :tada::hugging:!', title:'NOTIFICATION FROM VALARIUM', color: 0xfade78
        }, [{name: 'Mod: ', value: commandMessage.author}])
      }
      catch(err){console.log(err)}
    },
  },
  helpers:{
    sendEmbedNotification: async function(__ENV, member = undefined, embedOptions, fields, attachments = undefined, channels = undefined){
      try{
        let embed = new RichEmbed(embedOptions)
        if(fields.length > 0){
          fields.forEach(field => field.name==='Moderator' || field.name==='Member'? embed.addField(field.name, field.value, true): embed.addField(field.name, field.value))
        }
        if(attachments){
          attachments.forEach(attachment=>{
            embed.attachFile(attachment.path)
          })
        }
        embed.setThumbnail('https://lh4.googleusercontent.com/Yic_fQ7O-bo2q1ELjzBTQaR3ljVG-coyKsj87E55QzuxrH4b0K1F2ZchjFVrQ_QBA93fc1xWczkD7LGPMTsO')
        if(channels){
          channels.forEach(channel=>{
            channel.send(embed)
          })
        }
        if(member){
          let DMChannel = await member.createDM()
          DMChannel.send(embed)
        }
      }
      catch(err){console.log(err)}
    },
    getWarnings: async (warnedMember, __ENV)=>{
      try{
        let warnings = await __ENV.__DATABASE_OBJECT.collection('warnings').findOne({USER_ID: warnedMember.id})
        return warnings
      }
      catch(err){console.log(err)}
    }
  }
}

module.exports = commands