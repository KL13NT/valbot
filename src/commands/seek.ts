import ValClient from "../ValClient";
import { Command, CommandContext } from "../structures";
import { MusicController } from "../controllers";
import { log, reply, formatDuration } from "../utils/general";
import { TextChannel } from "discord.js";

export default class Seek extends Command {
	constructor(client: ValClient) {
		super(client, {
			name: "seek",
			category: "Music",
			cooldown: 10 * 1000,
			nOfParams: 1,
			description: "Seek to position in seconds.",
			exampleUsage: "05:05",
			extraParams: false,
			optionalParams: 0,
			auth: {
				method: "ROLE",
				required: "AUTH_EVERYONE",
			},
		});
	}

	_run = async ({ member, message, params }: CommandContext) => {
		try {
			const voiceChannel = member.voice.channel;
			const textChannel = message.channel as TextChannel;
			const controller = this.client.controllers.get(
				"music",
			) as MusicController;

			if (this.client.voice.connections.size === 0) {
				await reply("Bot.VoiceNotConnected", message.channel);
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

			if (controller.playState !== "playing") {
				await reply("Music.NotPlaying", textChannel);
				return;
			}

			const { duration, title, url } = controller.getCurrentSong();
			const timestamp = this.stringToTimestamp(params[0]);

			if (this.isInvalidTimestamp(timestamp)) {
				await reply("Command.Seek.Invalid", textChannel);
				return;
			}

			// Song duration is represented in milliseconds.
			if (timestamp > duration / 1000) {
				await reply("Command.Seek.TimeExceeded", textChannel);
				return;
			}

			await reply("Command.Seek.Seeked", textChannel, {
				title,
				url,
				timestamp: formatDuration(timestamp * 1000),
			});

			controller.seek(timestamp);
		} catch (err) {
			log(this.client, err, "error");
		}
	};

	stringToTimestamp = (time: string) => {
		return time
			.split(":")
			.map(period => Number(period))
			.reduce((accumulator, period) => 60 * accumulator + period, 0);
	};

	isInvalidTimestamp = (timestamp: number) => {
		return isNaN(timestamp) || timestamp < 0;
	};
}
