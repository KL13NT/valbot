import progressbar from "string-progressbar";
import ValClient from "../ValClient";
import logger from "../utils/logging";

import { Command, CommandContext } from "../structures";
import { MusicController } from "../controllers";
import { formatDuration, reply } from "../utils/general";

export default class NowPlaying extends Command {
	constructor(client: ValClient) {
		super(client, {
			name: "np",
			category: "Music",
			cooldown: 5 * 1000,
			nOfParams: 0,
			description: "ايه للي شغال دلوقتي",
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
		const controller = this.client.controllers.get("music") as MusicController;
		const voiceChannel = member.voice.channel;

		if (this.client.voice.connections.size === 0) {
			await reply("Bot.VoiceNotConnected", message.channel, {});
			return;
		}

		if (!voiceChannel) {
			await reply("User.VoiceNotConnected", message.channel, {});
			return;
		}

		if (!controller.canUserPlay(voiceChannel)) {
			await reply("User.SameChannel", message.channel, {});
			return;
		}

		const song = controller.getCurrentSong();

		if (!song) {
			await reply("Command.NowPlaying.NoSong", message.channel, {});
			return;
		}

		if (song.live) {
			await reply("Command.NowPlaying.Live", message.channel, {
				title: song.title,
				url: song.url,
				member: song.requestingUserId,
				id: controller.currentSongIndex + 1,
			});

			return;
		}

		if (typeof controller.getCurrentStreamTime() === "undefined") {
			await reply("Command.NowPlaying.NotStarted", message.channel, {});
			return;
		}

		const current =
			controller.getCurrentStreamTime() +
			controller.getCurrentPosition() * 1000;

		logger.debug("Now Playing");

		const total = song.duration;
		const seekbar = progressbar.splitBar(total, current, 15, "▬", "🔘")[0];

		await reply("Command.NowPlaying.Song", message.channel, {
			title: song.title,
			url: song.url,
			member: song.requestingUserId,
			seekbar,
			current: formatDuration(current),
			total: formatDuration(total),
			id: controller.currentSongIndex + 1,
		});
	};
}
