const { Command } = require('../structures')
const { CommandOptions } = require('../structures')

const { log } = require('../utils/utils')

class Debug extends Command {
	/**
	 * Constructs help command
	 * @param {ValClient} client
	 */
	constructor(client) {
		const options = new CommandOptions({
			name: `debug`,
			category: 'Development',
			cooldown: 1000,
			nOfParams: 1,
			requiredRole: 'dev',
			description: `بتوريك الاداء بتاع البوت و معلومات عن البروسيس بتاعه`,
			exampleUsage: `<"on"|"off">`,
			extraParams: false,
			auth: {
				method: 'ROLE',
				required: 'AUTH_DEV',
				devOnly: true
			}
		})

		super(client, options)
	}

	async _run(context) {
		const { CHANNEL_BOT_STATUS } = this.client.config.CHANNELS
		const { AUTH_DEV } = this.client.config.ROLES

		const { message, params } = context

		if (params[0] === 'on') {
			if (this.client.controllers.intervals.exists('debug'))
				return message.reply('انا مشغل الdebugger اصلا يبشا')

			message.reply(`I'll report on the dev channel <#${CHANNEL_BOT_STATUS}>`)

			log(this.client, 'Logging every 2000ms', 'warn')
			this.client.controllers.intervals.setInterval(
				2000,
				{ name: 'debug' },
				() => {
					log(this.client, this.usageToString(), 'info')
				}
			)
		} else if (params[0] === 'off') {
			if (!this.client.controllers.intervals.exists('debug'))
				return message.reply('انا مش مشغل الdebugger اصلا يبشا')

			message.reply(`قفلت الـ debugger خلاص`)

			log(this.client, 'Logger disabled', 'warn')
			this.client.controllers.intervals.clearInterval('debug')
		} else return message.reply('اول باراميتر المفروض يبقى on او off')
	}

	usageToString() {
		const { heapTotal, heapUsed } = process.memoryUsage()
		const { argv } = process

		return `
		ValBot NodeJS Process Debug Info
		--------------------------------
		Total heap: used ${heapUsed / 1024 / 1024} / ${heapTotal / 1024 / 1024}
		Process arguments: ${argv.join(', ')}
		`
	}
}

module.exports = Debug
