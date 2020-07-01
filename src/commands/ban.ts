import ValClient from '../ValClient';

import { Command, CommandContext } from '../structures';
import { ban } from '../utils/moderation';
import { log } from '../utils/general';

export default class Ban extends Command {
	constructor(client: ValClient) {
		super(client, {
			name: 'ban',
			category: 'Moderation',
			cooldown: 1000,
			nOfParams: 2,
			description: 'بتطرد ميمبر من السيرفر, مبيقدرش يخش تاني',
			exampleUsage: '<user_mention> <reason>',
			extraParams: true,
			optionalParams: 0,
			auth: {
				method: 'ROLE',
				required: 'AUTH_MOD'
			}
		});
	}

	_run = async ({ member, message, channel, params }: CommandContext) => {
		const [mention, ...reasonWords] = params;
		const mentionRegex = /<@!(\d+)>/;

		try {
			if (!mentionRegex.test(mention)) {
				await message.reply('لازم تعمل منشن للـ member');
				return;
			}

			const id = mention.match(mentionRegex)[1];
			const reason = reasonWords.join(' ');

			await ban(this.client, {
				member: id,
				moderator: member.id,
				channel: channel.id,
				reason
			});
		} catch (err) {
			log(this.client, err, 'error');
		}
	};
}
