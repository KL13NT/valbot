const Discord = require('discord.js')
const { prefix, token } = require('./config.json')

const __VALARIUM_CLIENT = new Discord.Client();

(async () => {
  try{
    await __VALARIUM_CLIENT.login(token)
  }
  catch(err){
    console.log('Error when loggin in using token. client.js:11', err)
  } 
})()

module.exports = { __VALARIUM_CLIENT }


/**
 * MESSAGE {
 *  CHANNEL_ID,
 *  ID,
 *  WATCHED_REACTIONS [
 *    REACTION{
 *      REACTION_NAME,
 *      REACTION_ROLE_ID
 *      REACTION_ROLE_NAME  
 *    }
 *  ]
 * }
 */