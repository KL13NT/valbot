//commands! 
const { RichEmbed } = require('discord.js')

let commands =  {
  misc: {
    ping: (message)=>{
      message.channel.send('Ping!')
    },
    mentionRole: (message)=>{
      message.channel.send(`<@&${message.mentions.roles.first().id}>`)
    },
    mentionUser: (message)=>{
      message.channel.send(`<@${message.mentions.users.first().id}>`)
    }
  },
  notifications:{
    DMUser: (member, notification)=>{
      member.createDM()
        .then(DMChannel=>{
          DMChannel.send(notification)
        })
    }
  },
  mod: {
    allowedRoles: [
      '571716246660448318', //President
      '571705643073929226', //Leaders
    ],
    clear: (message)=>{
      message.channel.bulkDelete(10)
        .then(messages => console.log(`Bulk deleted ${messages.size} messages`))
        .catch(console.error)
    },
    warn: async (commandMessage, args, __ENV)=>{
      try{
        let warnedUser = await __ENV.__VALARIUM_GUILD().fetchMember(args[3].toString().replace(/<|>|@/ig, ''))
        let userWarnings = (await __ENV.__DATABASE_OBJECT.collection('warnings').findOneAndUpdate({USER_ID: warnedUser.id}, {
          '$push': { 
            RECORDED_WARNINGS: {
              WARNING_REASON: args[4],
            }   
          }
        }, {upsert: true, returnOriginal: false})).value
        
        await commands.helpers.sendEmbedNotification(__ENV, warnedUser, {author: 'VALARIUM', description: `You've been warned in Valarium. You now have ${userWarnings.RECORDED_WARNINGS.length} warnings.`, title:`WARNING, ${warnedUser}`, color: 0xfade78}, [], [], [__ENV.__MODERATION_NOTICES_CHANNEL()])

        if(userWarnings.RECORDED_WARNINGS.length === 3){
          commands.mod.ban(commandMessage, args, __ENV, 'Warned 3 times')
        }
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
            botMessage.edit(`What's the expected role for that reaction? Update your message to reflect that!`)

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
        let warnings = await __ENV.__DATABASE_OBJECT.collection('warning').find({USER_ID: args[3].toString().replace(/<|>|@/ig, '')}).warnings
        bannedMember.ban({days: 3, reason})
        commands.helpers.sendEmbedNotification(__ENV, bannedMember, { 
          author: 'VALARIUM', description: `You've been banned eternally from Valarium after ${warnings.length} warnings.`, title:'NOTIFICATION FROM VALARIUM', color: 0xfade78
        }, [{name: 'Mod: ', value: commandMessage.author}])
      }
      catch(err){ console.log(err) }
    },
    unban: async function(commandMessage, args, __ENV, reason){
      try{
        let bannedMember = await __ENV.__VALARIUM_CLIENT.fetchUser(args[3].toString().replace(/<|>|@/ig, ''), {cache: true})

        await __ENV.__VALARIUM_GUILD().unban(bannedMember, reason)

        commands.helpers.sendEmbedNotification(__ENV, bannedMember, { 
          author: 'VALARIUM', description: `You've been unbanned from Valarium. Enjoy your stay :tada::hugging:!`, title:'NOTIFICATION FROM VALARIUM', color: 0xfade78
        }, [{name: 'Mod: ', value: commandMessage.author}])
      }
      catch(err){console.log(err)}
    },
  },
  helpers:{
    sendEmbedNotification: async function(__ENV, member, embedOptions, fields, attachments, channels){
      //default options author: 'VALARIUM', description: `You've been banned eternally from Valarium after ${warnings.length} warnings.`, title:'NOTIFICATION FROM VALARIUM', color: 0xfade78}
      try{
        let DMChannel = await member.createDM()
        let embed = new RichEmbed(embedOptions)
        if(fields.length > 0){
          fields.forEach(field=>{
            embed.addField(field.name, field.value)
          })
        }
        if(attachments.length > 0){
          attachments.forEach(attachment=>{
            embed.attachFile(attachment.path)
          })
        }
        embed.setThumbnail('https://lh4.googleusercontent.com/Yic_fQ7O-bo2q1ELjzBTQaR3ljVG-coyKsj87E55QzuxrH4b0K1F2ZchjFVrQ_QBA93fc1xWczkD7LGPMTsO')
        if(channels.length > 0){
          channels.forEach(channel=>{
            channel.send(embed)
          })
        }
        await DMChannel.send(embed)
        __ENV.__MODERATION_NOTICES_CHANNEL().send(`${member}, ${embedOptions.description}`)
      }
      catch(err){console.log(err)}
    },
  }
}

module.exports = commands