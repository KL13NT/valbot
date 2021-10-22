import { TextChannel } from "discord.js";
import { MusicController } from "../controllers";
import { Command, CommandContext } from "../structures";
import { reply } from "../utils/general";
import ValClient from "../ValClient";

export default class Refresh extends Command {
	constructor(client: ValClient) {
		super(client, {
			name: "refresh",
			category: "Music",
			cooldown: 15 * 1000,
			nOfParams: 0,
			description: "Refreshes a stream when it lags",
			exampleUsage: "",
			extraParams: false,
			optionalParams: 0,
			auth: {
				method: "ROLE",
				required: "AUTH_EVERYONE",
			},
		});
	}

	_run = async ({ member, message }: CommandContext) => {
		const voiceChannel = member.voice.channel;
		const textChannel = message.channel as TextChannel;
		const controller = this.client.controllers.get("music") as MusicController;

		if (this.client.voice.connections.size === 0) {
			await reply("Bot.VoiceNotConnected", textChannel);
			return;
		}

		if (!voiceChannel) {
			await reply("User.VoiceNotConnected", textChannel);
			return;
		}

		if (!controller.canUserPlay(voiceChannel)) {
			await reply("User.SameChannel", textChannel);
			return;
		}

		const song = controller.getCurrentSong();

		if (!song) {
			await reply("Music.NotPlaying", textChannel);
			return;
		}

		if (controller.playState === "paused") {
			await reply("Command.Refresh.Paused", textChannel);
			return;
		}

		await reply("Command.Refresh.Refreshed", textChannel);

		await controller.refresh();
	};
}
