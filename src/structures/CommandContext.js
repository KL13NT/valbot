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

module.exports = class CommandContext{
  //options is destructured here! 
  constructor (client, message, command) {
    this.hasError = false
    try{
      this.client = client
      this.message = message
      this.author = message.author
      this.member = message.member
      this.channel = message.channel
      this.voiceChannel = message.member.voiceChannel
      this.guild = message.guild
      this.command = command
    }
    catch(err){
      console.log(`Context creation failed`)
      this.hasError = true
    }
  }
  
  isReady(){
    return this.hasError? false: true
  }
  
}