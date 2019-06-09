//commands! 

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
    warnLanguage: (message)=>{
      message.channel.send(`Watch your language, <@${message.author.id}>! This is a warning! اخلاقك يشيخنا!`)
        .then(sent => {
          setTimeout(()=>{
            sent.delete().catch(console.error)
          }, 2000)
        })
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
                console.log(__ENV.__AVAILABLE_ROLES, newMessage.content)
                if(__ENV.__AVAILABLE_ROLES.find(role => role.name === newMessage.content)){
                  reactionMessage.react(reaction.emoji.name)
                  botMessage.edit('Successful. Awaiting reactions.')
                  expectedReaction.role = newMessage.content
                  const userReactionsCollector = reactionMessage.createReactionCollector(reaction=>reaction.emoji.name === expectedReaction.name)
                  console.log(reactionMessage.channel.id)
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
            // reaction.fetchUsers()
            //   .then(users=>{
            //     users.forEach(user=>{
            //       message.guild.fetchMember(user.id).then(member=>{
            //         member.addRole(__AVAILABLE_ROLES.find(role => role.name==='I Can Read!').id)
            //       })
            //     })
            //   })
          })
      
        })
      }
      catch(err){
        console.error(err)
      }
    }
  },
}

module.exports = commands