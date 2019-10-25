const { Client } = require(`discord.js`)
const fs = require(`fs`)
const path = require(`path`)
const Loaders = require(`./loaders`)


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
    //TODO: add initialise loaders
  }

  async init (token) {
    const CLILogo = fs.readFileSync(path.resolve(`./text/bigtitle.txt`), `utf8`).toString()
    
    await this.login(token)

    if (this.isLoggedin) {
      console.log(`${ CLILogo }\nClient initiated successfully.`)
      
      this.importantChannels.MEMBER_COUNT = this.channels.find(channel => channel.id === `586768857113296897`)
      this.importantChannels.MODERATION_NOTICES = this.channels.find(channel => channel.id === `587571479173005312`)
    }

    this.initLoaders()
  }

  async login (token = process.env.AUTH_TOKEN) {
    try {
      await super.login(token)
      this.isLoggedin = true
    }
    catch (err) {
      console.error(`Something went wrong while loggin in. Retrying again in 5s.`, err)
      this.setTimeout(this.login, 5000)
    }
  }

  async runCommand (command, context, args) {
    //TODO: refactor
    if (context.guild && !command.hidden) {
      const deepSubcmd = (c, a) => {
        const [arg] = a
        const cmd = c.subcommands
          ? c.subcommands.find(s => s.name.toLowerCase() === arg || (s.aliases && s.aliases.includes(arg)))
          : null
        return cmd ? deepSubcmd(cmd, a.slice(1)) : c
      }
      const verify = await this.modules.commandRules.verifyCommand(deepSubcmd(command, args), context)
      if (!verify) return
    }

    return command._run(context, args).catch(this.logError)
  }

  async initLoaders () {
    //Load loaders from file
    for (const loader in Loaders) {
      try {
        const currentLoader = new Loaders[loader](this)
        await currentLoader.load()
      } catch (err) {
        // log err
      } 
    }
  }
}