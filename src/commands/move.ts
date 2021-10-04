import ValClient from "../ValClient";
import { Command, CommandContext } from "../structures";
import { MusicController } from "../controllers";
import { log, reply } from "../utils/general";
import { TextChannel } from "discord.js";

export default class Move extends Command {
	constructor(client: ValClient) {
		super(client, {
			name: "move",
			category: "Music",
			cooldown: 2 * 1000,
			nOfParams: 2,
			description:
				"moves a certain track from its position to a specified position when passing one song index it moves the song to the next index so it is played next",
			exampleUsage: "4 5",
			extraParams: false,
			optionalParams: 1,
			aliases: ["m"],
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

			const songIndex = Number(params[0]) - 1;
			const newIndex: number =
				params.length === 1
					? controller.currentSongIndex + 1
					: Number(params[1]) - 1;

			if (isNaN(songIndex) || isNaN(newIndex)) {
				await reply("Command.Move.Invalid", textChannel);
				return;
			}

			const queueLength = controller.queue.length;

			if (
				songIndex === controller.currentSongIndex ||
				newIndex === controller.currentSongIndex
			) {
				await reply("Command.Move.CurrentlyPlaying", textChannel);
				return;
			}

			if (
				songIndex >= queueLength ||
				songIndex < 0 ||
				newIndex >= queueLength ||
				newIndex < 0
			) {
				await reply("Command.Move.OutOfBoundaries", textChannel);
				return;
			}

			const { title, url } = controller.queue[songIndex];

			await reply("Command.Move.Moved", textChannel, {
				id: songIndex + 1,
				title,
				url,
				index: newIndex + 1,
			});

			controller.move(songIndex, newIndex);
			return;
		} catch (err) {
			log(this.client, err, "error");
		}
	};
}
