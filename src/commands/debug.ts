import ValClient from '../ValClient';

import { Command, CommandContext } from '../structures';
import { log } from '../utils/general';
import { IntervalsController } from '../Controllers';

export default class Debug extends Command {
	constructor(client: ValClient) {
		super(client, {
			name: `debug`,
			category: 'Development',
			cooldown: 1000,
			nOfParams: 1,
			description: `بتوريك الاداء بتاع البوت و معلومات عن البروسيس بتاعه`,
			exampleUsage: `<"on"|"off">`,
			extraParams: false,
			optionalParams: 0,
			auth: {
				method: 'ROLE',
				required: 'AUTH_DEV',
				devOnly: true
			}
		});
	}

	_run = async (context: CommandContext) => {
		const { CHANNEL_BOT_STATUS } = this.client.config.CHANNELS;
		const { message, params } = context;

		const intervals = <IntervalsController>(
			this.client.controllers.get('intervals')
		);

		if (params[0] === 'on') {
			if (intervals.exists('debug'))
				return message.reply('انا مشغل الdebugger اصلا يبشا');

			message.reply(`I'll report on the dev channel <#${CHANNEL_BOT_STATUS}>`);

			log(this.client, 'Logging every 2000ms', 'warn');
			intervals.setInterval({
				time: 2000,
				name: 'debug',
				callback: () => {
					log(this.client, this.usageToString(), 'info');
				}
			});
		} else if (params[0] === 'off') {
			if (!intervals.exists('debug'))
				return message.reply('انا مش مشغل الdebugger اصلا يبشا');

			message.reply(`قفلت الـ debugger خلاص`);

			log(this.client, 'Logger disabled', 'warn');
			intervals.clearInterval('debug');
		} else return message.reply('اول باراميتر المفروض يبقى on او off');
	};

	usageToString = () => {
		const { heapTotal, heapUsed } = process.memoryUsage();
		const { argv } = process;

		return `
		ValBot NodeJS Process Debug Info
		--------------------------------
		Total heap: used ${heapUsed / 1024 / 1024} / ${heapTotal / 1024 / 1024}
		Process arguments: ${argv.join(', ')}
		`;
	};
}
