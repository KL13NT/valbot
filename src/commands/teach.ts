import ValClient from "../ValClient";

import { TextChannel } from "discord.js";
import { Command, CommandContext } from "../structures";
import { ConversationController } from "../controllers";

import { awaitMessages } from "../utils/general";

export default class Teach extends Command {
	constructor(client: ValClient) {
		super(client, {
			name: `teach`,
			category: "Management",
			cooldown: 1000,
			nOfParams: 1,
			description: `بتعلم البوت يرد على حاجة`,
			exampleUsage: `<invoker>`,
			extraParams: true,
			optionalParams: 1,
			auth: {
				method: "ROLE",
				required: "AUTH_ADMIN",
			},
		});
	}

	_run = async (context: CommandContext) => {
		const { message, params, member } = context;
		const channel = <TextChannel>context.channel;
		const invoker = params.join(" ").replace(/"/g, "").replace(/\s+/, " ");

		if (params.length === 0) {
			await message.reply(`\n${this.getResponses().join("\n")}`);
			return;
		}

		if (invoker.length < 2) {
			await message.reply(`لازم يكون الرسالة الاولية طويلة كفاية`);
			return;
		}

		await message.reply("المفروض ارد ازاي بقى؟");

		const collected = await awaitMessages(channel, member);
		await this.collectionSuccess(context, invoker, collected);
	};

	getResponses = () => {
		const conversation = <ConversationController>(
			this.client.controllers.get("conversation")
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
		reply: string,
	) => {
		const conversation = <ConversationController>(
			this.client.controllers.get("conversation")
		);

		await conversation.teach({
			invoker,
			reply,
		});

		await message.reply(`تمام, هبقى ارد على "${invoker}" بـ "${reply}"`);
	};
}
