const Discord = require('discord.js')
const {prefix, token} = require('./config.json')

let __VALARIUM_CLIENT = new Discord.Client()


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