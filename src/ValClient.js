const { Client } = require(`discord.js`)
const fs = require(`fs`)
const path = require(`path`)
const Loaders = require(`./loaders`)
const Listeners = require(`./listeners`)

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

  async init (token) {
    try {
      const CLILogo = fs.readFileSync(path.resolve(__dirname, `../text/bigtitle.txt`), `utf8`).toString()
      
      await this.login(token)
  
      if (this.isLoggedin) {
        console.log(`${ CLILogo }\nClient initiated successfully.`)
        
        this.importantChannels.memberCount = this.channels.find(channel => channel.id === `586768857113296897`)
        this.importantChannels.moderationNotices = this.channels.find(channel => channel.id === `587571479173005312`)
        
        this.initLoaders()
        this.initListeners()
        this.setPresence()
        this.updateMemberCount()
      }
      else throw Error(`Something went wrong while logging in`)
    }
    catch(err){
      console.log(`Failed to init`, err.message, err.stack)
      //log error
    }
  }

  async updateMemberCount (){
    this.importantChannels.memberCount
  }

  async setPresence (){
    const { customPresences } = this
    
    setInterval(() => {
      
      const randomPresence = customPresences[Math.floor(Math.random() * customPresences.length)]
      this.user.setActivity(randomPresence.message, { type: randomPresence.type })

    }, 10 * 60 * 1000)
  }

  async login (token = process.env.AUTH_TOKEN) {
    try {
      await super.login(token)
      this.isLoggedin = true
    }
    catch (err) {
      console.error(`Something went wrong while loggin in. Retrying again in 3s.`, err)
      this.setTimeout(this.login, 3000)
    }
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