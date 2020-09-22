import { Command } from '../structures';
import { log } from '../utils/general';
import ValClient from '../ValClient';
import { CommandContext } from '../structures';
import { Presence } from '../types/interfaces';
import { ActivityType } from 'discord.js';

export default class PresenceSet extends Command {
	constructor(client: ValClient) {
		super(client, {
			name: 'presenceset',
			category: 'Management',
			cooldown: 1000,
			nOfParams: 3,
			description: 'بتعدل على الـ presence',
			exampleUsage:
				'<PLAYING|STREAMING|LISTENING|WATCHING> <PRIORITY:TRUE|FALSE> <ACTIVITY:STRING>',
			extraParams: true,
			optionalParams: 0,
			auth: {
				method: 'ROLE',
				required: 'AUTH_ADMIN'
			}
		});
	}

	_run = async ({ params, message }: CommandContext) => {
		try {
			const [type, priority, ...name] = params;
			const activityType = <ActivityType>type;
			const copy = Array.from(this.client.presences).filter(p => !p.priority); // remove other priority presences to avoid unexpected behaviour

			if (
				!/^(PLAYING|STREAMING|LISTENING|WATCHING)$/i.test(
					activityType.toLowerCase()
				)
			) {
				await message.reply('حدد Type معروفة');
				return;
			}

			if (priority && !/^(true|false)$/i.test(priority.toLowerCase())) {
				await message.reply('لازم تحدد priority يا اما TRUE يا اما FALSE');
				return;
			}

			const isPriority =
				priority && priority.toLowerCase() === 'true' ? true : false;

			const newPresence: Presence = {
				status: 'dnd',
				activity: {
					name: name.join(' '),
					type: activityType
				},
				priority: isPriority
			};

			this.client.presences = [newPresence, ...copy];

			await this.client.setPresence();

			await message.reply('تم');
		} catch (err) {
			log(this.client, err, 'error');
		}
	};
}
