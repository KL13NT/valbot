const ValClient = new (require(`./src/ValClient`))({ fetchAllMembers: true })
// const Database = new (require(`./src/database/Database`))()
const Logger = new (require(`./src/utils/Logger`))(__dirname, `./logs`)
// function initGlobals (){
//   global.__ENV = {
//     __DATABASE_OBJECT: {},
//     __AVAILABLE_ROLES: {},
//     __WATCHED_MESSAGES: {},
//     __DISCORD_EXPLANATION: {},
//     __WARNING_EXCEPTIONS: ['238009405176676352'],
//     __VALARIUM_GUILD: function () { return this.__VALARIUM_CLIENT.guilds.find(guild => guild.name === 'VALARIUM') },
//     __TEST_CHANNEL: function () { return this.__VALARIUM_GUILD().channels.filter(channel => channel.id === '571824874969104416') }
//   }
// }

//WORK UNDER PROGRESS
//If you've landed on this codebase it means you've been given permission to modify and/or redistribute
//I'm currently moving the codebase from a webpack based approach 
//to a pure serverless environment so it's taking some time
//TODO: add user join listener and welcomer/tutorial
async function start () {

  Logger.file(`info`, `Starting ValClient`)
  await ValClient.init(process.env.AUTH_TOKEN)
  Logger.file(`info`, `ValClient logged in successfully`)

  // We don't need a database currently so
  // Logger.file(`info`, `Initialising Database`)
  // if(Database.init()) Logger.file(`info`, `Initialised Database successfully`)

}

ValClient.on(`ready`, async function (){
  Logger.console(`info`, `\n${this.CLILogo}`)
  Logger.file(`info`, `Client ready status reached`)

  await this.initListeners()
  await this.setPresence()
})

start()

// import 'regenerator-runtime/runtime'
// import commands from './commands'

// // const fs = require('fs')
// // const path = require('path')
// // const util = require('util')
// // const Discord = require('discord.js')
// // const insults = require('./src/commands/insults')
// // const { prefix, token } = require('./config.json')


// import { updateMemberCount, onStartup, checkWatchedMessage, craftWelcomeMessage, isAllowedToUseCommand } from './utils'


// global.__ENV = {
//   __VALARIUM_CLIENT: require('./src/ValClient').__VALARIUM_CLIENT,
//   __DATABASE_OBJECT: {},
//   __AVAILABLE_ROLES: [],
//   __WATCHED_MESSAGES: [],
//   __DISCORD_EXPLANATION: {},
//   __WARNING_EXCEPTIONS: ['238009405176676352'],
//   __VALARIUM_GUILD: function (){ return this.__VALARIUM_CLIENT.guilds.find(guild => guild.name === 'VALARIUM') },
//   __MEMBER_COUNT_CHANNEL: function (){ return this.__VALARIUM_GUILD().channels.find(channel => channel.id === '586768857113296897') },
//   __MODERATION_NOTICES_CHANNEL: function (){ return this.__VALARIUM_GUILD().channels.find(channel => channel.id === '587571479173005312') },
//   __TEST_CHANNEL: function (){ return this.__VALARIUM_GUILD().channels.filter(channel => channel.id === '571824874969104416') }
// }

// //Loading discordExplanation.md file
// fs.readFile('discordExplanation.md', 'utf8', (err, data) => {
//   try{
//     if (err) throw err
//     const fullMessage = data
//     __ENV.__DISCORD_EXPLANATION.part1 = fullMessage.substr(0, fullMessage.indexOf('THIS IS THE BREAK!'))
//     __ENV.__DISCORD_EXPLANATION.part2 = fullMessage.substr(fullMessage.indexOf('THIS IS THE BREAK!') + 'THIS IS THE BREAK!'.length)
//   }
//   catch(err){
//     console.log('Something went wrong when reading discordExplanation.md')
//   }
// })



// __ENV.__VALARIUM_CLIENT.on('raw', async packet => {
//   try{
//     // We don't want this to run on unrelated packets
//     if (!['MESSAGE_REACTION_ADD', 'MESSAGE_REACTION_REMOVE'].includes(packet.t)) return
//     const channel = __ENV.__VALARIUM_CLIENT.channels.get(packet.d.channel_id)

//     //TODO: Add listener for cached messages to allow for better speed

//     const message = await channel.fetchMessage(packet.d.message_id)
//     const watchedMessage = checkWatchedMessage(message)

//     if(watchedMessage != null && watchedMessage != undefined){
//       const reactedMember = message.member
//       const reaction = watchedMessage.WATCHED_REACTIONS.find(reaction => reaction.REACTION_NAME === packet.d.emoji.name)
      
//       if(reaction != null && reaction != undefined){
//         if(packet.t === 'MESSAGE_REACTION_ADD') await reactedMember.addRole(reaction.REACTION_ROLE_ID)
//         else if(packet.t === 'MESSAGE_REACTION_REMOVE') await reactedMember.removeRole(reaction.REACTION_ROLE_ID)
//       }
//       else throw Error('REACTION OBJECT UNDEFINED/NULL')
//     }
//     else return

//   }
//   catch(err){
//     console.log(`ERROR IN REACTION HANDLING\n${err}`)
//   }
// })






// //NEW USERS HANDLING
// __ENV.__VALARIUM_CLIENT.on('guildMemberAdd', async member => {
//   try{
//     updateMemberCount()
    
//     const DMChannel = await member.createDM()

//     //Set #newcomer role
//     await member.addRole('586612246571122718')

//     //Welcome
//     await DMChannel.send(craftWelcomeMessage(member.displayName))

//     //Tutorial
//     await DMChannel.send(`\`\`\`md\n${__ENV.__DISCORD_EXPLANATION.part1}\`\`\``)
//     await DMChannel.send(`\`\`\`md\n${__ENV.__DISCORD_EXPLANATION.part2}\`\`\``)
    
//     const channel = member.guild.channels.find(ch => ch.name === 'ｖ﹞main-chat')

//     if(channel) await channel.send(`Everyone, greet ${member}! Welcome to Valarium, your new home! :sweat_smile::raised_hands::fireworks:`)
//   }
//   catch(err){
//     console.log('ERROR IN GUILD MEMBER ADD', err)
//   }
// })


// __ENV.__VALARIUM_CLIENT.on('guildMemberRemove', async () => {
//   try{
//     updateMemberCount()
//   }
//   catch(err){
//     console.log('ERROR IN GUILD MEMBER REMOVE', err)
//   }
// })




// /**
//  * Checks whether a message is being watched for reactions
//  * @function
//  * @async
//  * @param {Message} message The message object to check
//  * @return {Document} The watched message fetched from DB
//  * @since 1.0.0 
//  */


// const isUserInExceptions = message => false
// // __ENV.__WARNING_EXCEPTIONS.includes(message.member.id)


// const formatMessage = message => {
//   return [prefix, command, ...rest] = message.split(' ')
// } 




// async function handleMessage (message){
//   try{
//     const [messagePrefix, commandName, ...rest] = message.content.split(' ')
//     const hasInsult = insults.test(message.content)

//     if(messagePrefix === prefix){
//       const isAllowed = isAllowedToUseCommand(message.member, commandName)
//       const isValid = commands.hasOwnProperty(commandName)

//       if(isAllowed && isValid) commands[commandName](message, rest)
//       else if (!isValid) commands.reply(message, 'it seems my database has not yet been exposed to such knowledge. :sob:')
//       else commands.reply(message, 'you\'re not allowed to use that command.')
//     }
    
//     if(hasInsult && !isUserInExceptions(message)){
//       const reason = 'This user has used a swear word/insulted someone'

//       commands.mute(message, [message.member.id, reason])
//       commands.warn(message, [message.member.id, reason])
//       message.reply('behave yourself! :angry::triangular_flag_on_post:')
//       message.delete()
//     }

//     //Initialise a poll
//     if(message.channel.id === '571717874146607129') message.react('✅') && message.react('❌')

//   }
//   catch(err){ 
//     console.log('ERROR IN MESSAGE HANDLING: handleMessage\n', err) 
//     console.trace()
//   }
// }




// __ENV.__VALARIUM_CLIENT.on('message', handleMessage)