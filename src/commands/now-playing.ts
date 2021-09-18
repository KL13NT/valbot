import progressbar from "string-progressbar";
import prettyMilliseconds from "pretty-ms";

import ValClient from "../ValClient";
import { Command, CommandContext } from "../structures";
import { MusicController } from "../controllers";
import { createEmbed } from "../utils/embed";
import { log, reply } from "../utils/general";

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
			await message.reply(
				createEmbed({
					description: "Bot is not in a voice channel.",
				}),
			);
			return;
		}

		if (!voiceChannel) {
			await message.reply(
				createEmbed({
					description: `You're not connected to a voice channel`,
				}),
			);
			return;
		}

		if (!controller.canUserPlay(voiceChannel)) {
			await message.reply(
				createEmbed({
					description: "You must be in the same channel as the bot",
				}),
			);
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
			});

			return;
		}

		const current = controller.getCurrentStreamTime();
		if (typeof current === "undefined") {
			await reply("Command.NowPlaying.NotStarted", message.channel, {});
			return;
		}

		log(this.client, "Now Playing", "info");

		const total = song.duration;
		const seekbar = progressbar.splitBar(total, current, 15, "▬", "🔘")[0];

		await reply("Command.NowPlaying.Song", message.channel, {
			title: song.title,
			url: song.url,
			member: song.requestingUserId,
			seekbar,
			current: this.formatDuration(current),
			total: this.formatDuration(total),
		});
	};

	/** Display milliseconds in HH:MM:SS format */
	private formatDuration = (duration: number): string => {
		return prettyMilliseconds(duration, {
			colonNotation: true,
			secondsDecimalDigits: 0,
		});
	};
}
