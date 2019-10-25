const { CommandContext } = require(`..`)
const { Listener } = require(`../structures`)
const { CLIENT_ID: BotID } = process.env

module.exports = class MessageListener extends Listener {
  constructor (client) {
    super(client, [
      `message`
    ])
    
    this.onReady()
  }

  Controller (message){
    const { mentions: { users } } = message
    if(users.some(user => user.id === BotID)) this.onBotMention(message)
  }


  async onReady () {
    const { customPresences } = this.client
    
    setInterval(() => {
      
      const randomPresence = customPresences[Math.floor(Math.random() * customPresences.length)]
      this.client.user.setActivity(randomPresence.message, { type: randomPresence.type })

    }, 10 * 60 * 1000)
  }

  onMessage (message){
    if(message.author.id !== BotID && message.author.id === `238009405176676352`) message.reply(`I got that!`) //remove this experimental &&
  }



  onBotMention (message){

  }
}