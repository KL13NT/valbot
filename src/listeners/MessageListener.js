const { CommandContext } = require(`..`)
const { Listener } = require(`../structures`)
const { CLIENT_ID } = process.env

module.exports = class MessageListener extends Listener {
  constructor (client) {
    super(client, [
      `message`
    ])
  }

  onMessage (message){
    if(message.author.id !== CLIENT_ID && message.type !== `dm`){
      if(message.content.startsWith(this.prefix)){
        //call respsective command
        message.reply(`commands aren't available yet, check again later.`)
      }
      else if(message.mentions.members.has(CLIENT_ID)) this.onBotMention(message)
    }
    return 
  }

  onCommand (message){
    
  }


  onBotMention (message){
    message.reply(`I'm currently working on adding new commands, stop pinging me.`)
  }
}