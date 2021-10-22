import ValClient from "../ValClient";

import { TextChannel } from "discord.js";

import { Command, CommandContext } from "../structures";
import { awaitMessages } from "../utils/general";
import {
	getChannelObject,
	getChannelFromMention,
	localToBuffer,
} from "../utils/object";

export default class Announce extends Command {
	constructor(client: ValClient) {
		super(client, {
			name: "announce",
			category: "Management",
			cooldown: 5 * 1000,
			nOfParams: 1,
			description: `بتعمل اعلان بالشكل اللي تحبه.`,
			exampleUsage: `<channel_mention>`,
			extraParams: false,
			optionalParams: 1,
			auth: {
				method: "ROLE",
				required: "AUTH_ADMIN",
			},
		});
	}

	_run = async (context: CommandContext): Promise<void> => {
		const { message, member, params } = context;
		const channel = <TextChannel>context.channel;

		const target = getChannelObject(
			this.client,
			getChannelFromMention(params[0]),
		);

		if (!target) {
			await message.reply("التشانل دي مش موجودة او مش فويس");
			return;
		}

		await message.reply("ابعت بقى الـ announcement");

		const announcement = await awaitMessages(channel, member);

		const hooks = await channel.fetchWebhooks();
		const hook =
			hooks.find(hook => hook.name === "Announcements") ||
			(await target.createWebhook("Announcements", {
				avatar: localToBuffer("../../media/valariumlogo.png"),
				reason: "Announcing",
			}));

		await hook.send(announcement);
	};
}
