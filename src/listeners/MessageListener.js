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
    setInterval(() => {
      const { presences } = this.client
      const RandomPresence = presences[Math.floor(Math.random() * presences.length)]
      
      this.user.setActivity(RandomPresence)
    }, 10 * 60 * 1000)
  }

  onMessage (message){

  }



  onBotMention (message){

  }
}