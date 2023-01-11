import { getVoiceConnections } from "@discordjs/voice";
import { MusicController } from "../controllers";
import Interaction from "../structures/Interaction";
import InteractionContext from "../structures/InteractionContext";
import { reply } from "../utils/general";
import ValClient from "../ValClient";

export default class Refresh extends Interaction {
	constructor(client: ValClient) {
		super(client, {
			name: "refresh",
			category: "Music",
			cooldown: 15 * 1000,
			options: [],
			description: "Refreshes a stream when it lags",
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
		const voiceChannel = member.voice.channel;
		const controller = this.client.controllers.get("music") as MusicController;

		const connections = getVoiceConnections();

		if (connections.size === 0) {
			await reply("Bot.VoiceNotConnected", textChannel, null, interaction);
			return;
		}

		if (!voiceChannel) {
			await reply("User.VoiceNotConnected", textChannel, null, interaction);
			return;
		}

		if (!controller.canUserPlay(voiceChannel)) {
			await reply("User.SameChannel", textChannel, null, interaction);
			return;
		}

		const song = controller.getCurrentSong();

		if (!song) {
			await reply("Music.NotPlaying", textChannel, null, interaction);
			return;
		}

		if (controller.playState === "paused") {
			await reply("Command.Refresh.Paused", textChannel, null, interaction);
			return;
		}

		await reply("Command.Refresh.Refreshed", textChannel, null, interaction);

		await controller.refresh();
	};
}
