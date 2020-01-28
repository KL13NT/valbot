const { Client } = require(`discord.js`)

const fs = require(`fs`)
const path = require(`path`)
const Loaders = require(`./loaders`)
const Listeners = require(`./listeners`)
const Logger = new (require(`./utils/Logger`))(__dirname, `../logs`)
const ToxicityFilter = require(`./utils/InsultFiltering`)


/**
 * @param { ClientOptions	} options DiscordClientOptions
 * @param { String } prefix The prefix used for all commands
 */

class ValClient extends Client {
  constructor (options = {}, prefix) {
    super(options)
    this.isLoggedin = false
    this.prefix = prefix || `val!`
    this.importantChannels = {}
    this.commands = {}
    this.customPresences = [
      { message: `for val!`, type: `WAITING` },
      { message: `something?`, type: `PLAYING` },
      { message: `Dubstep`, type: `LISTENING` }
    ]
    this.warnedMembers = {}
    this.mutedMembers = {}

    this.mutedChecker()
    this.importantRoles = {
      muted: `586839490102951936`
    }
  }

  async mutedChecker (){
    this.setInterval(() => {
      const newTime = new Date().getTime()

      for(const muted in this.mutedMembers){
        if(newTime - muted.time >= 1000 * 60 * 15) {
          const member = this.guilds[0].members.find(member => member.id == muted.id)
          if(member) member.removeRole(this.importantRoles.muted)
        }
        
      }
    }, 1000 * 60 * 5) // every 5 minutes
    //TODO: check for muted and unmute after 15 mins
  }

  /**
   * @param message
   */
  async autoWarn (message){
    const { member } = message
    const { id } = member
    const warnings = this.warnedMembers[id]
    
    if(warnings){
      console.log(warnings)
      if(warnings == 2){
        message.reply(`you're getting muted for 15 for your toxic behaviour`)
        member.addRole(this.importantRoles.muted)
        
        const muted = {
          time: new Date().getTime(),
          id: id
        }

        this.mutedMembers[id] = { ...muted }
        delete this.warnedMembers[id]
      }
      else this.warnedMembers[id] = warnings + 1
    }
    else this.warnedMembers[id] = 1
  }

  async init (token = process.env.AUTH_TOKEN) {
    try {
      this.ToxicityFilter = new ToxicityFilter(0.8)

      this.CLILogo = fs.readFileSync(path.resolve(__dirname, `../text/bigtitle.txt`), `utf8`).toString()

      this.initLoaders()
      await super.login(token)
    }
    catch(err){
      Logger.file(`error`, `Error while client logging in. ${err.message}, ${JSON.stringify(err.stack)}`)
    }
  }

  async setPresence (){
    const { customPresences, user } = this
		console.log(this.user)
    setInterval(() => {
      
      const randomPresence = customPresences[Math.floor(Math.random() * customPresences.length)]
      user.setActivity(randomPresence.message, { type: randomPresence.type })
      
      console.log(`Current presence: ${randomPresence.type} ${randomPresence.message}`)
      
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

module.exports = ValClient