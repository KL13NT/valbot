import { TextChannel } from "discord.js";
import progressbar from "string-progressbar";

import ValClient from "../ValClient";
import logger from "../utils/logging";

import Interaction from "../structures/Interaction";
import InteractionContext from "../structures/InteractionContext";
import { MusicController } from "../controllers";
import { formatDuration, reply } from "../utils/general";
import { getVoiceConnections } from "@discordjs/voice";

export default class NowPlaying extends Interaction {
	constructor(client: ValClient) {
		super(client, {
			name: "now-playing",
			category: "Music",
			cooldown: 5 * 1000,
			options: [],
			description: "See what's currently playing.",
			auth: {
				method: "ROLE",
				required: "AUTH_EVERYONE",
			},
			aliases: ["np"],
		});
	}

	_run = async ({ member, interaction }: InteractionContext) => {
		const textChannel = interaction.channel as TextChannel;
		const controller = this.client.controllers.get("music") as MusicController;
		const voiceChannel = member.voice.channel;

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
			await reply("Command.NowPlaying.NoSong", textChannel, null, interaction);
			return;
		}

		if (song.live) {
			await reply(
				"Command.NowPlaying.Live",
				textChannel,
				{
					title: song.title,
					url: song.url,
					member: song.requestingUserId,
					id: controller.currentSongIndex + 1,
				},
				interaction,
			);

			return;
		}

		if (typeof controller.getCurrentStreamTime() === "undefined") {
			await reply(
				"Command.NowPlaying.NotStarted",
				textChannel,
				null,
				interaction,
			);
			return;
		}

		const current =
			controller.getCurrentStreamTime() +
			controller.getCurrentPosition() * 1000;

		logger.debug("Now Playing");

		const total = song.duration;
		const seekbar = progressbar.splitBar(total, current, 15, "▬", "🔘")[0];

		await reply(
			"Command.NowPlaying.Song",
			textChannel,
			{
				title: song.title,
				url: song.url,
				member: song.requestingUserId,
				seekbar,
				current: formatDuration(current),
				total: formatDuration(total),
				id: controller.currentSongIndex + 1,
			},
			interaction,
		);
	};
}
