import { enforceCommandArguments, roleExists, messageExists, channelExists } from '../utils/utils'

export const reactionRoles = async (message, rest) => {
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