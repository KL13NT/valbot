/**
 * @external Guild
 * @description Discord's Guild Class
 * @see {@link https://discord.js.org/#/docs/main/stable/class/Guild|Guild}
 */

/**
 * @prop {ValClient} client The current ValClient instance
 * @prop {GuildMessage} message Message object
 * @prop {User} message.author Author(User) who sent the message
 * @prop {Guild} message.guild Guild in which message was sent
 * @prop {GuildMember} message.member Member who sent the message
 * @prop {GuildChannel} message.channel The channel of the message
 * @prop {AuthLevel} userAuthLevel Authorization level of user
 * @prop {array} params Params the command's _run is expecting
 */

class CommandContext{
	/**
	 * @param {ValClient} client The current ValClient instance
 	 * @param {GuildMessage} message Message object
	 */
	constructor (client, message) {
		if(client && message.author && message.member){
			this.client = client
			this.message = message
			this.author = message.author
			this.member = message.member
			this.channel = message.channel
			this.guild = message.guild
			this.userAuthLevel = 4
			this.params = []
		}
	}
}

module.exports = CommandContext