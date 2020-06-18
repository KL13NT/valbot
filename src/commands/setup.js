const { Command } = require('../structures')
const { CommandOptions } = require('../structures')
const {
	log,
	getMemberObject,
	getRoleObject,
	notify,
	awaitMessages
} = require('../utils/utils')

class Setup extends Command {
	/**
	 * Constructs help command
	 * @param {ValClient} client
	 */
	constructor(client) {
		const options = new CommandOptions({
			name: `setup`,
			cooldown: 1000,
			nOfParams: 0,
			description: `بتعمل setup للبوت. مينفعش تعمل cancel.`,
			exampleUsage: ``,
			extraParams: false,
			auth: {
				method: 'ROLE',
				required: 'AUTH_DEV',
				devOnly: true
			}
		})

		super(client, options)
	}

	async _run({ channel, member, message }) {
		const configTemplate = [
			'AUTH.AUTH_ADMIN',
			'AUTH.AUTH_MOD',
			'AUTH.AUTH_VERIFIED',
			'AUTH.AUTH_EVERYONE',

			'CHANNELS.CHANNEL_NOTIFICATIONS',
			'CHANNELS.CHANNEL_RULES',
			'CHANNELS.CHANNEL_POLLS',
			'CHANNELS.CHANNEL_TEST',
			'CHANNELS.CHANNEL_BOT_STATUS',
			'CHANNELS.CHANNEL_MOD_LOGS',

			'ROLES.ROLE_MUTED',
			'ROLES.ROLE_WARNED'
		]

		const config = {}

		message.reply('starting config setup. This is irreversible.')

		const questions = configTemplate.map(variable =>
			getKeyValue.bind(null, variable)
		)

		for (const question of questions) {
			await question()
		}

		message.reply('Saving config')

		this.setConfig(config)
		this.client.ready = true

		async function getKeyValue(path) {
			const filter = m => m.author.id === member.id
			const awaitOptions = {
				max: 1,
				time: 60 * 1000
			}

			const collection = path.split('.')[0]
			const value = path.split('.')[1]

			if (!config[collection]) config[collection] = {}

			channel.send(path)
			config[collection][value] = await awaitMessages(
				channel,
				filter,
				awaitOptions
			)
		}
	}

	async setConfig(config) {
		if (this.controllers.mongo.ready && this.controllers.redis.ready) {
			this.client.config = config

			this.client.controllers.mongo.db.collection('config').updateOne(
				{ GUILD_ID: String(process.env.GUILD_ID) },
				{
					$set: {
						...config,
						GUILD_ID: String(process.env.GUILD_ID)
					}
				},
				{ upsert: true }
			)
		} else {
			this.client.controllers.queue.enqueue(this.setConfig, config)
		}
	}
}

module.exports = Setup
