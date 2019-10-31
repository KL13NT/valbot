const { CommandContext } = require(`..`)
const { Listener } = require(`../structures`)
const { CLIENT_ID: BotID } = process.env

module.exports = class NewGuildMemberListener extends Listener {
  constructor (client) {
    super(client, [
      `guildMemberAdd`
    ])
    
    this.onReady()
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