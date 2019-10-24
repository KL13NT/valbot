const { Client } = require('discord.js')
const fs = require('fs')
const path = require('path')
const Loaders = require('./loaders')

module.exports = class ValClient extends Client {
  constructor (options = {}) {
    super(options)
    this.isLoggedin = false
    this.IMPORTANT_CHANNELS = {}
    //TODO: add initialise loaders
  }

  async init (token) {
    const CLILogo = fs.readFileSync(path.resolve('bigtitle.txt'), 'utf8').toString()
    
    await this.login(token)

    if (this.isLoggedin) {
      console.log(`${ CLILogo }\nClient initiated successfully.`)
      
      this.IMPORTANT_CHANNELS.MEMBER_COUNT = this.channels.find(channel => channel.id === '586768857113296897')
      this.IMPORTANT_CHANNELS.MODERATION_NOTICES = this.channels.find(channel => channel.id === '587571479173005312')
    }
  }

  async login (token = process.env.AUTH_TOKEN) {
    try {
      await super.login(token)
      this.isLoggedin = true
    }
    catch (err) {
      console.error('Something went wrong while loggin in. Retrying again in 5s.', err)
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

  async initializeLoaders () {
    //Load loaders from file
    for (const loader in Loaders) {
      const currentLoader = new Loaders[loader](this)
      let success = false
      try {
        success = await currentLoader.init()
      } catch (err) {
        // log err
      } finally {
        if (!success) process.exit(1)
      }
    }
  }
}