const { Command } = require("../structures")
const { CommandOptions } = require("../structures")

const { log } = require('../utils/utils')

class Debug extends Command {
	/**
	 * Constructs help command
	 * @param {ValClient} client
	 */
  constructor(client) {
		const options = new CommandOptions({
			name: `debug`,
			cooldown: 1000,
			nOfParams: 1,
			requiredRole: 'dev',
			description: `بتوريك الاداء بتاع البوت و معلومات عن البروسيس بتاعه`,
			exampleUsage: `<"on"|"off">`,
			extraParams: false
		})

		super(client, options)
  }

  async _run(context) {
		const { message, params } = context

		if(params[0] === 'on'){
			if(IntervalsController.exists('debug')) return message.reply('انا مشغل الdebugger اصلا يبشا')

			message.reply(`I'll report on the dev channel ${this.client.config.IMPORTANT_CHANNELS['bot_status']}`)

			log(this.client, 'Logging every 2000ms', 'warn')
			IntervalsController.setInterval(2000, {name: 'debug'}, ()=>{
				log(this.client, this.usageToString(), 'info')
			})
		}
		else if(params[0] === 'off'){
			if(!IntervalsController.exists('debug')) return message.reply('انا مش مشغل الdebugger اصلا يبشا')

			message.reply(`قفلت الـ debugger خلاص`)

			log(this.client, 'Logger disabled', 'warn')
			IntervalsController.clearInterval('debug')
		}
		else return message.reply('اول باراميتر المفروض يبقى on او off')

	}

	usageToString(){
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