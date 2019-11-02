const { Client } = require(`discord.js`)
const fs = require(`fs`)
const path = require(`path`)
const Loaders = require(`./loaders`)
const Listeners = require(`./listeners`)
const Logger = new (require(`./utils/Logger`))(__dirname, `../logs`)
/**
 * @param { ClientOptions	} options DiscordClientOptions
 * @param { String } prefix The prefix used for all commands
 */

module.exports = class ValClient extends Client {
  constructor (options = {}, prefix) {
    super(options)
    this.isLoggedin = false
    this.prefix = prefix || `val!`
    this.importantChannels = {}
    this.commands = {}
    this.customPresences = [
      { message: `for val!`, type: `WATCHING` },
      { message: `something?`, type: `PLAYING` },
      { message: `Spotify`, type: `LISTENING` }
    ]
    //TODO: add initialise loaders
  }

  async init (token = process.env.AUTH_TOKEN) {
    try {
      this.CLILogo = fs.readFileSync(path.resolve(__dirname, `../text/bigtitle.txt`), `utf8`).toString()

      this.initLoaders()
      await super.login(token)
    }
    catch(err){
      Logger.file(`error`, `Error while client logging in. ${err.message}, ${JSON.stringify(err.stack)}`)
    }
  }

  async updateMemberCount (){
    const membersCountChannel = this.guilds.first().channels.find(channel => channel.id === `586768857113296897`)
    console.log(this.guilds.first().members.length)
    console.log(membersCountChannel)
    membersCountChannel.edit({ name: this.guilds.first().members.length })
    // this.importantChannels.memberCount.setName(`Members: ${this.users.length}`)
  }

  async setPresence (){
    const { customPresences } = this
    
    setInterval(() => {
      
      const randomPresence = customPresences[Math.floor(Math.random() * customPresences.length)]
      this.user.setActivity(randomPresence.message, { type: randomPresence.type })

    }, 10 * 60 * 1000)
  }

  async runCommand (command, context, args){}

  async initLoaders () {
    //Load loaders from file
    for (const loader in Loaders) {
      try {
        const currentLoader = new Loaders[loader](this)
        await currentLoader.load()
      } catch (err) {
        console.log(err)
      } 
    }
  }

  async initListeners (){
    for (const listener in Listeners) {
      try {
        new Listeners[listener](this)
        
      } catch (err) {
        console.log(err)
      } 
    }
  }
}