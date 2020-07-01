import ValClient from '../ValClient';

import { Command, CommandContext } from '../structures';
import { log } from '../utils/general';
import { Message } from 'discord.js';
import { LevelsController } from '../controllers';

export default class MilestoneRemove extends Command {
	constructor(client: ValClient) {
		super(client, {
			name: `milestoneremove`,
			category: 'Management',
			cooldown: 1000,
			nOfParams: 1,
			description: `بتشيل مايلستوون معينة`,
			exampleUsage: `<level>`,
			extraParams: false,
			optionalParams: 0,
			auth: {
				method: 'ROLE',
				required: 'AUTH_ADMIN'
			}
		});
	}

	_run = async (context: CommandContext) => {
		const levels = <LevelsController>this.client.controllers.get('levels');
		const filter = (m: Message) => m.author.id === member.id;
		const awaitOptions = {
			time: 60 * 1000,
			max: 1
		};

		const { message, member, params, channel } = context;
		const levelRegex = /(\d+)/i;
		const level = Number(params[0].match(levelRegex)[0]);

		try {
			if (isNaN(level)) {
				await message.reply(
					'لازم تحدد الـ level اللي عايز تشيل منه الـ milestone'
				);
				return;
			}

			await message.reply('ايه اسم الـ achievement؟');

			const name = (await channel.awaitMessages(filter, awaitOptions)).first()
				.content;

			await levels.removeMilestone(level, name);

			await message.reply('شيلت الـ milestone دي');
		} catch (err) {
			log(this.client, err, 'error');
		}
	};
}
