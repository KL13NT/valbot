import ValClient from '../ValClient';

import { Message } from 'discord.js';
import { Command, CommandContext } from '../structures';
import { ConversationController } from '../Controllers';

import { log } from '../utils/general';

export default class Teach extends Command {
	constructor(client: ValClient) {
		super(client, {
			name: `teach`,
			category: 'Management',
			cooldown: 1000,
			nOfParams: 0,
			description: `بتعلم البوت يرد على حاجة`,
			exampleUsage: `${client.prefix} teach hello`,
			extraParams: true,
			optionalParams: 1,
			auth: {
				method: 'ROLE',
				required: 'AUTH_ADMIN'
			}
		});
	}

	_run = async (context: CommandContext) => {
		const { message, channel, params, member } = context;
		const invoker = params.join(' ').replace(/"/g, '').replace(/\s+/, ' ');
		const collectorOptions = { max: 1, time: 60000, errors: ['time'] };
		const collectorFilter = (m: Message) => m.author.id === member.id;

		try {
			if (params.length === 0) {
				await message.reply(`\n${this.getResponses().join('\n')}`);
				return;
			}

			if (invoker.length < 2) {
				await message.reply(`لازم يكون الرسالة الاولية طويلة كفاية`);
				return;
			}

			await message.reply('المفروض ارد ازاي بقى؟');

			channel
				.awaitMessages(collectorFilter, collectorOptions)
				.then(collected =>
					this.collectionSuccess(context, invoker, collected.first().content)
				)
				.catch(async () => {
					await message.reply('وقتك خلص, جرب تاني');
				});
		} catch (err) {
			log(this.client, err, 'error');
		}
	};

	getResponses = () => {
		const conversation = <ConversationController>(
			this.client.controllers.get('conversation')
		);
		const responses = conversation.getAllResponses();

		const reply = Object.values(responses).map(res => {
			return `${res.invoker}\n الرد: ${res.reply}\n--------\n`;
		});

		return reply;
	};

	collectionSuccess = async (
		{ message }: CommandContext,
		invoker: string,
		reply: string
	) => {
		const conversation = <ConversationController>(
			this.client.controllers.get('conversation')
		);

		await conversation.teach({
			invoker,
			reply
		});

		await message.reply(`تمام, هبقى ارد على "${invoker}" بـ "${reply}"`);
	};
}
