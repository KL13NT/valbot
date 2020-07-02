import ValClient from '../ValClient';

import { TextChannel } from 'discord.js';

import { Command, CommandContext } from '../structures';
import { log, awaitMessages } from '../utils/general';
import { ReminderSubscription } from '../types/interfaces';

export default class Remindme extends Command {
	constructor(client: ValClient) {
		super(client, {
			name: 'remindme',
			category: 'Misc',
			cooldown: 30 * 1000,
			nOfParams: 0,
			description: 'قولي افكرك بحاجة امتى و هفكرك.',
			exampleUsage: '',
			extraParams: false,
			optionalParams: 0,
			auth: {
				method: 'ROLE',
				required: 'AUTH_VERIFIED'
			}
		});
	}

	_run = async (context: CommandContext): Promise<void> => {
		const { message, member } = context;
		const channel = <TextChannel>context.channel;
		// // const TIME_FORMAT =
		// 	'<Number of day>/<Number of month>/<Number of year> <hh>:<mm>';
		const example = '12/05/2020 20:30';
		const timeRegex = /^(\d{1,2})\/(\d{1,2})\/(\d{4})\s(\d{1,2}):(\d{1,2})$/;

		try {
			await message.reply('افكرك بأيه؟');
			const description = await awaitMessages(channel, member);

			await message.reply(`امتى؟ اكتب الوقت بالفورمات دي: \`${example}\``);
			const time = await awaitMessages(channel, member);
			const match = time.match(timeRegex);

			if (!match) {
				message.reply('في حاجة غلط ف اللي انت كتبته, اتأكد من الوقت.');
				return;
			}

			const [, day, month, year, hour, mins] = match;

			const date = new Date(
				Number(year),
				Number(month) - 1, // offset index
				Number(day),
				Number(hour) - 2, // GMT+2 to UTC
				Number(mins)
			).getTime();

			const sub: ReminderSubscription = {
				description,
				member: member.id
			};
		} catch (err) {
			log(this.client, err, 'error');
		}
	};
}
