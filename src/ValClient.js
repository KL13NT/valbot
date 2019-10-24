const { Client } = require('discord.js')
// const Loaders = require('./loaders')

//TODO: use object instead of array for commands
export class ValClient extends Client {
  constructor (options = {}) {
    super(options)
    // this.initialiseLoaders()
    //TODO: add initialise loaders
  }

  async login (token = process.env.AUTH_TOKEN) {
    try {
      await super.login(token)
    }
    catch (err) {
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

  // async initializeLoaders () {
  //   //Load loaders from file
  //   for (const name in Loaders) {
  //     const loader = new Loaders[name](this)
  //     let success = false
  //     try {
  //       success = await loader.load()
  //     } catch (e) {
  //       this.logError(e)
  //     } finally {
  //       if (!success && loader.critical) process.exit(1)
  //     }
  //   }
  // }
}