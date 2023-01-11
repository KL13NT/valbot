import { getVoiceConnections } from "@discordjs/voice";

import ValClient from "../ValClient";
import Interaction from "../structures/Interaction";
import InteractionContext from "../structures/InteractionContext";
import { MusicController } from "../controllers";
import { reply } from "../utils/general";

export default class ClearQueue extends Interaction {
	constructor(client: ValClient) {
		super(client, {
			name: "clear-queue",
			category: "Music",
			cooldown: 5 * 1000,
			options: [],
			description: "Clears the queued songs",
			aliases: ["stop", "clear", "cq"],
			auth: {
				method: "ROLE",
				required: "AUTH_EVERYONE",
			},
		});
	}

	_run = async ({
		member,
		interaction,
		channel: textChannel,
	}: InteractionContext) => {
		const controller = this.client.controllers.get("music") as MusicController;
		const voiceChannel = member.voice.channel;

		if (!voiceChannel) {
			await reply("User.VoiceNotConnected", textChannel, null, interaction);
			return;
		}

		if (!controller.canUserPlay(voiceChannel)) {
			await reply("User.SameChannel", textChannel, null, interaction);
			return;
		}

		const connections = getVoiceConnections();

		if (connections.size === 0) {
			await reply("Bot.VoiceNotConnected", textChannel, null, interaction);
			return;
		}

		if (controller.queue.length === 0) {
			await reply(
				"Command.ClearQueue.AlreadyEmpty",
				textChannel,
				null,
				interaction,
			);
			return;
		}

		await reply("Command.ClearQueue.Cleared", textChannel, null, interaction);

		await controller.clear();
	};
}
