/**
 * Command Structure
 * @constructor
 * @param {ValClient} client Valarium-bot client
 * @param {Object} options Command initialisation options
 * @param {String} options.name Command name
 * @param {Number} [options.cooldownTime=0] Time between calls to the same command, default 0
 * @param {String} [options.category=general] Category of command
 * @param {Array} [options.flags=[]] Required for the command to function properly
 * @param {aliases} [options.aliases=[]] Aliases for the command
 */
export default class CommandStructure{

  constructor(client, options = {}) {
    const { name, flags, category, aliases, cooldownTime } = options
    
    this.client = client
    this.name = name
    this.cooldownTime = cooldownTime || 0
    this.category = category || 'general'
    this.flags = flags || []
    this.aliases = aliases || []
  }
  
  async prerun(context) {
    if()
  }

  handleRequirements(context, requirements) {
    const { client, message, author, member, channel, voiceChannel, guild, command, prefix } = context
  } 

  checkFlags(flags) {
    const POSSIBLE_FLAGS = [
      'dev-only',
      'admin-only',
      'same-channel-only',
      'database-only',
      'no-cooldown'
    ]
    flags.
  }
}