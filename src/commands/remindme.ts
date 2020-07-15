import ValClient from '../ValClient';

import { TextChannel } from 'discord.js';

import { Command, CommandContext } from '../structures';
import { log, awaitMessages } from '../utils/general';
import { ReminderSubscription } from '../types/interfaces';
import { RemindersController } from '../controllers';

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
		const reminders = <RemindersController>(
			this.client.controllers.get('reminders')
		);

		const { message, member } = context;
		const channel = <TextChannel>context.channel;
		const example = '12/05/2020 20:30';
		const timeRegex = /^(\d{1,2})\/(\d{1,2})\/(\d{4})\s(\d{1,2}):(\d{1,2})$/;

		try {
			await message.reply('افكرك بأيه؟');
			const description = await awaitMessages(channel, member);

			await message.reply(
				`امتى؟ الوقت بالفورمات دي: \n\`${example}\`.\nخلي ف اعتبارك ان كل التواريخ بتتسجل بالتوقيت الـ UTC يعني GMT`
			);
			const time = await awaitMessages(channel, member);
			const match = time.match(timeRegex);

			if (!match) {
				await message.reply('في حاجة غلط ف اللي انت كتبته, اتأكد من الوقت.');
				return;
			}

			const [, day, month, year, hour, mins] = match;

			const date = new Date(
				Date.UTC(
					Number(year),
					Number(month) - 1, // offset index
					Number(day),
					Number(hour),
					Number(mins)
				)
			).getTime();

			const sub: ReminderSubscription = {
				description,
				member: member.id
			};

			const count = await reminders.countRemindersOfMember(member.id);
			if (count.length >= 2) {
				await message.reply('مينفعش تعمل اكتر من 2 ريمايندرز');
				return;
			}

			const reminder = reminders.getReminder(date);
			if (reminder && reminder.find(sub => sub.member === member.id)) {
				await message.reply('انت مسجل ف الوقت ده بالفعل');
				return;
			}

			await reminders.addReminder(date, sub);
			await message.reply(`تم. هفكرك في ${new Date(date).toUTCString()}`);
		} catch (err) {
			log(this.client, err, 'error');
		}
	};
}
