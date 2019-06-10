const Discord = require('discord.js')
const {prefix, token} = require('./config.json')

const insults = require('./insults')
const commands = require('./commands')

const __ENV = {
  __DATABASE_OBJECT: {},
  __AVAILABLE_ROLES: {},
  __WATCHED_MESSAGES: {},
  __VALARIUM_CLIENT: require('./client').__VALARIUM_CLIENT,
  __VALARIUM_GUILD: function(){return this.__VALARIUM_CLIENT.guilds.find(guild=>guild.name === 'VALARIUM')}
}


__ENV.__VALARIUM_CLIENT.once('ready', async () => {
  console.log('Ready!')
  __ENV.__DATABASE_OBJECT = await require('./dbconnect').getDB()
  __ENV.__AVAILABLE_ROLES = await __ENV.__DATABASE_OBJECT.collection('AVAILABLE_ROLES').find({}).toArray()
  __ENV.__WATCHED_MESSAGES = await __ENV.__DATABASE_OBJECT.collection('WATCHED_MESSAGES').find({}).toArray()

  
  __ENV.__AVAILABLE_ROLES = await __ENV.__DATABASE_OBJECT.collection('AVAILABLE_ROLES').find({}).toArray()
})

/**
 * Checks whether a message is being watched for reactions
 * @function
 * @name checkWatchedMessage
 * @param {Message} message The message object to check
 * @return {Document} The watched message fetched from DB
 */
function checkWatchedMessage(message){
  return __ENV.__WATCHED_MESSAGES.find(watched => watched.MESSAGE_ID === message.id)
}

__ENV.__VALARIUM_CLIENT.on('raw', packet => {
  try{
    // We don't want this to run on unrelated packets
    if (!['MESSAGE_REACTION_ADD', 'MESSAGE_REACTION_REMOVE'].includes(packet.t)) return

    const channel = __ENV.__VALARIUM_CLIENT.channels.get(packet.d.channel_id)

    // if (channel.messages.has(packet.d.message_id)) return
    //TODO: Add listener for cached messages to allow for better speed

    channel.fetchMessage(packet.d.message_id).then(message => {
      let watchedMessage = checkWatchedMessage(message)

      if(watchedMessage != null && watchedMessage != undefined){
        __ENV.__VALARIUM_GUILD().fetchMember(packet.d.user_id)
          .then(member=>{
            let reaction = watchedMessage.WATCHED_REACTIONS.find(reaction => reaction.REACTION_NAME === packet.d.emoji.name)
            console.log(reaction)
            if(reaction != null && reaction != undefined){
              member.addRole(reaction.REACTION_ROLE_ID)
              member.createDM()
                .then(DMChannel=>{
                  DMChannel.send(`You've been granted role ${reaction.REACTION_ROLE_NAME}`)
                })
            }
            else return
          })
          .catch(rejection=>{
            console.log(rejection)
          })
      }
    })
  }
  catch(err){
    console.log(err)
  }
})

__ENV.__VALARIUM_CLIENT.login(token)

// const President = __ENV.__VALARIUM_GUILD().roles.find(role => role.name === "President")
// const Leaders = __ENV.__VALARIUM_GUILD().roles.find(role => role.name === "Leaders")

// const allowedRoles = {
//   other: [
//     President, //President
//     Leaders, //Leaders
//     Organisers, //Organisers
//     Contributors
//   ],
//   moderation: [
//     '571716246660448318', //President
//     '571705643073929226', //Leaders
//   ],
// }


//THIS BOT API IS BASED AS FOLLOWS: 
//PREFIX COMMAND_TYPE COMMAND_NAME COMMAND_PARAMETER
//val! mod ban userMention
//val! misc ping


//NEW USERS HANDLING
__ENV.__VALARIUM_CLIENT.on('guildMemberAdd', member=>{
  const Organisers = __ENV.__VALARIUM_GUILD().roles.find(role => role.name === "Organisers")
  const Contributors = __ENV.__VALARIUM_GUILD().roles.find(role => role.name === "Contributors")

  member.addRole('586951260259876875')
    .catch(console.error)
  
  member.createDM()
    .then(DMChannel=>{
      DMChannel.send(`Hey, ${member.displayName}, Welcome to Valarium :tada::hugging:! We are glad to have you with us! Please consider reading the <#571718462179770369> and getting yourself some <#586620199457914904> :wink: before heading to <#571721246362959919> to contribute to our great community!`)
      .catch(console.error)
    })
    .catch(console.error)

  const channel = member.guild.channels.find(ch => ch.name === 'ｖ﹞main-chat')

  if(channel) channel.send(`Everyone, greet ${member}! Welcome to Valarium, your new home! :sweat_smile::raised_hands::fireworks:  ${Contributors} ${Organisers}`).catch(console.error)
})


// __ENV.__VALARIUM_CLIENT.on('raw', event => {
// 	console.log('\nRaw event data:\n', event);
// });
//COMMANDS/MESSAGES HANLDING
__ENV.__VALARIUM_CLIENT.on('message', message => {
  try{
    let args = message.content.split(' ')
    if(args[0] === prefix){
      if (commands.hasOwnProperty(args[1])) {
        if(commands[args[1]].hasOwnProperty(args[2])){ //allowed commands channel ---- (args.length === 4? commands.hasOwnProperty(args[3]):true)
          commands[args[1]][args[2]].call(this, message, args, __ENV)
        }
        else throw new Error(`I couldn't recognise that.`)
      }
      else throw new Error(`I couldn't recognise that.`)
    }
    //TODO: Integrate warnings with database to ban users based on number of warnings
    else if(insults.test(message.content)){ //insults handling
      commands.mod.warn.call(this, message, args, __ENV)
      setTimeout(()=>{
        message.delete()
          .catch(console.error)
      }, 1000)
    }
  }
  catch(err){message.channel.send(err.message)}
})
