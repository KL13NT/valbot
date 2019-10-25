const Context = require(`./CommandContext`)

/**
 * Command Structure
 * @constructor
 * @param {ValClient} client Valarium-bot client
 * @param {Object} context Command context
 * @param {Object} options Command initialisation options
 * @param {String} options.name Command name
 * @param {Number} [options.cooldownTime=0] Time between calls to the same command, default 0
 * @param {String} [options.category=general] Category of command
 * @param {Array} [options.flags=[]] Required for the command to function properly
 * @param {aliases} [options.aliases=[]] Aliases for the command
 */
module.exports =  class Command{

  constructor (client, options = {}) {
    const { name, flags, category, aliases, cooldownTime, critical } = options
    
    this.client = client
    
    this.name = name
    this.cooldownTime = cooldownTime || 0
    this.category = category || `general`
    this.flags = flags || []
    this.aliases = aliases || []
    this.critical = critical || false
    
    this.POSSIBLE_FLAGS = {
      'dev-only': `dev-only`,
      'admin-only': `admin-only`,
      'same-channel-only': `same-channel-only`,
      'database-only': `database-only`
    }

    if(!this.checkFlags(this.flags) && this.critical){
      console.log(Error(`Command ${this.name} has illegal flags and is critical, check the code and try again`))
      process.exit(1)
    }
  }

  async init (context) {
    try {
      if (this.checkContext(context)) this.run(context)
      else throw Error(`Context isn't an instance of ${Context}.`)
    }
    catch (err) {
      console.log(err)
      //TODO: Log error 
      //TODO: respond to user message with error embed/message
    }
  }

  checkContext (context){
    return context instanceof Context? true: false
  }


  async run (context) {
    // return true;
  }


  checkFlags (flags) {
    const isValid = flags.findIndex(flag => this.POSSIBLE_FLAGS[flag] === undefined)
    
    if (isValid === -1) return true
    return false
  }
}