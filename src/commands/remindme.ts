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
		const example = '12/05/2020 20:30 +02:00';
		const timeRegex = /^(\d{2})\/(\d{2})\/(\d{4})\s(\d{2}):(\d{2})\s?((\+|-)\d{2}:\d{2})?$/;

		try {
			await message.reply('افكرك بأيه؟');
			const description = await awaitMessages(channel, member);

			await message.reply(
				`امتى؟ الوقت بالفورمات دي: \n\`${example}\`.\n لاحظ برضة ان فورمات الساعة 24 مش 12. لاحظ انك لازم تحدد الفرق مابين التوقيت المحلي ليك و الـ UTC او GMT. اللي هو الجزء +02:00 اللي ف اخر المثال ده. لو مكتبتوش هعتبر انك في UTC.`
			);
			const time = await awaitMessages(channel, member);
			const match = time.match(timeRegex);

			if (!match) {
				await message.reply('في حاجة غلط ف اللي انت كتبته, اتأكد من الوقت.');
				return;
			}

			const [, DD, MM, YYYY, HH, mm, Z] = match;

			const now = new Date().getTime();
			const date = new Date(
				`${YYYY}-${MM}-${DD}T${HH}:${mm}:00.000${Z || 'Z'}`
			);
			const target = date.getTime();

			if (now >= target) {
				await message.reply('مينفعش تعمل ريمايندر لوقت سابق. بلاش هزار.');
				return;
			}

			const sub: ReminderSubscription = {
				description,
				member: member.id
			};

			const count = await reminders.countRemindersOfMember(member.id);
			if (count.length >= 2) {
				await message.reply('مينفعش تعمل اكتر من 2 ريمايندرز');
				return;
			}

			const reminder = reminders.getReminder(target);
			if (reminder && reminder.find(sub => sub.member === member.id)) {
				await message.reply('انت مسجل ف الوقت ده بالفعل');
				return;
			}

			await reminders.addReminder(target, sub);
			await message.reply(`تم. هفكرك في \n${date.toString()}`);
		} catch (err) {
			log(this.client, err, 'error');
		}
	};
}
