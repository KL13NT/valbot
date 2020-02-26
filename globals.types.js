/**
 * @external Guild
 * @description Discord's Guild Class
 * @see {@link https://discord.js.org/#/docs/main/stable/class/Guild|Guild}
 */


/**
 * @typedef {object} GuildMessage
 * @property {User} author Author(User) who sent the message
 * @property {Guild} guild Guild in which message was sent
 * @property {GuildMember} member Member who sent the message
 * @property {GuildChannel} channel The channel of the message
 * @see {@link https://discord.js.org/#/docs/main/stable/class/Message|Discord Message}
 */


/**
 * @typedef {object} ClientOptions
 * @property {boolean} isLoggedin
 * @property {string} [prefix=val!]
 * @property {string[]} IMPORTANT_CHANNELS
 */