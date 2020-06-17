const { Command, CommandOptions } = require(`../structures`)
const { generateRankCard } = require('../utils/svg')
const { log, getMemberObject } = require('../utils/utils')

const { AUTH_VERIFIED } = require('../config/config.js').AUTH

class Rank extends Command {
	constructor(client) {
		const commandOptions = new CommandOptions({
			name: `rank`,
			cooldown: 1000,
			nOfParams: 0,
			description: `بتشوف مستوى شخص ما`,
			exampleUsage: `<user_id>`,
			extraParams: true,
			auth: {
				method: 'ROLE',
				required: AUTH_VERIFIED
			}
		})
		super(client, commandOptions)
	}

	async _run(context) {
		try {
			const { message, params, channel, member: ctxMember } = context
			const [userMention] = params

			const id = userMention
				? userMention.replace(/<|>|!|@/g, '')
				: ctxMember.user.id

			if (id === process.env.CLIENT_ID || id === process.env.CLIENT_DEV_ID)
				return message.reply('متكترش هزار عشان ميتعملش عليك صريخ ضحك :"D')

			const member = getMemberObject(this.client, id)

			const res = await MongoController.getLevel(id)
			const avatar_url = member.user.displayAvatarURL()
			const displayName = member.user.username.substr(0, 12) + '...'
			const displayID = member.user.tag.split('#')[1]

			const voice = res ? res.voice : await RedisController.get(`VOICE:${id}`)
			const text = res ? res.text : await RedisController.get(`TEXT:${id}`)
			const exp = await RedisController.get(`EXP:${id}`)
			const level = await RedisController.get(`LEVEL:${id}`)

			const userInfo = {
				avatar_url,
				displayName,
				USER_ID: displayID
			}
			const levelInfo = {
				exp: exp || 1,
				text: text || 1,
				voice: voice || 1,
				level: level || 1,
				levelEXP: 60 * Number(level) * 0.1 + 60 || 1
			}

			const card = await generateRankCard(userInfo, levelInfo)
			message.reply("Here's the requested rank", {
				files: [
					{
						attachment: card
					}
				]
			})
		} catch (err) {
			console.error(err)
			context.message.reply(err.message)
			log(this.client, err, 'error')
		}
	}
}

module.exports = Rank
