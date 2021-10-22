import ValClient from "../ValClient";

import { Command, CommandContext } from "../structures";
import { mute, isMuted } from "../utils/moderation";

export default class Mute extends Command {
	constructor(client: ValClient) {
		super(client, {
			name: "mute",
			category: "Moderation",
			cooldown: 1000,
			nOfParams: 2,
			description: "بتمنع الشخص انه يتكلم فويس او تيكست لمدة 5 دقايق",
			exampleUsage: "<user_mention> <reason>",
			extraParams: true,
			optionalParams: 0,
			auth: {
				method: "ROLE",
				required: "AUTH_MOD",
			},
		});
	}

	_run = async ({ member, message, channel, params }: CommandContext) => {
		const [mention, ...reasonWords] = params;
		const mentionRegex = /<@!(\d+)>/;

		if (!mentionRegex.test(mention)) {
			await message.reply("لازم تعمل منشن للـ member");
			return;
		}

		const id = mention.match(mentionRegex)[1];
		const reason = reasonWords.join(" ");

		if (isMuted(this.client, id)) {
			await message.reply("معمولهم mute اصلاً");
			return;
		}

		await mute(this.client, {
			member: id,
			moderator: member.id,
			channel: channel.id,
			reason,
		});
	};
}
