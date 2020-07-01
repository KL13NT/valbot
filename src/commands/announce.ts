import ValClient from '../ValClient';

import { Message } from 'discord.js';

import { Command, CommandContext } from '../structures';
import { log } from '../utils/general';
import {
	getChannelObject,
	getChannelFromMention,
	localToBuffer
} from '../utils/object';

export default class Announce extends Command {
	constructor(client: ValClient) {
		super(client, {
			name: 'announce',
			category: 'Management',
			cooldown: 5 * 1000,
			nOfParams: 1,
			description: `بتعمل اعلان بالشكل اللي تحبه.`,
			exampleUsage: `<channel_mention>`,
			extraParams: false,
			optionalParams: 1,
			auth: {
				method: 'ROLE',
				required: 'AUTH_ADMIN'
			}
		});
	}

	_run = async (context: CommandContext): Promise<void> => {
		const { message, member, params, channel } = context;

		const filter = (m: Message) => m.author.id === member.id;
		const awaitOptions = {
			time: 60 * 1000,
			max: 1,
			errors: ['time']
		};

		const target = getChannelObject(
			this.client,
			getChannelFromMention(params[0])
		);

		try {
			if (!target) {
				await message.reply('التشانل دي مش موجودة او مش فويس');
				return;
			}

			await message.reply('ابعت بقى الـ announcement');

			const collected = await channel.awaitMessages(filter, awaitOptions);
			const announcement = collected.first().content;

			const hook = await target.createWebhook('Announcements', {
				avatar: localToBuffer('../../media/botlogo.png'),
				reason: 'Announcing'
			});

			await hook.send(announcement);
			await hook.delete('No longer needed');
		} catch (err) {
			log(this.client, err, 'error');
		}
	};
}
