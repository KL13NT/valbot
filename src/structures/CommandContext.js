//TODO:: import ValClient Class

/**
 * @param {Object} options The context options
 * @prop {ValClient} client The Valarium-Client
 * @prop {Message} message The command message
 * @prop {?GuildMember} member The author of the message as a guild member
 * @prop {TextChannel} channel The channel of the message
 * @prop {?VoiceChannel} voiceChannel The voice channel of the author of the message, if any
 * @prop {?Guild} guild The guild of the channel of the message
 * @prop {Command} command The command
 * @prop {string} prefix The command prefix
 */

export default class CommandContext{
  //options is destructured here! 
  constructor ({ client, message, command, prefix }) {
    this.client = client
    this.message = message
    this.author = message.author
    this.member = message.member
    this.channel = message.channel
    this.voiceChannel = message.member.voiceChannel
    this.guild = message.guild
    this.command = command
    this.prefix = prefix
  }

  check () {
    if (
      this.client instanceof ValClient
      && typeof this.message === 'object'  
      && this.author
      && this.member
      && this.channel
      && this.voiceChannel
      && this.guild 
      && this.command
      && this.prefix
    ) return true
    else throw Error('Command cannot be run')
    // TODO: Change into more complex check for specific errors and use logger instead of errors
  }
}