import ValClient from "../ValClient";
import { Command, CommandContext } from "../structures";
import { MusicController } from "../controllers";
import { reply } from "../utils/general";
import { TextChannel } from "discord.js";

export default class Move extends Command {
	constructor(client: ValClient) {
		super(client, {
			name: "move",
			category: "Music",
			cooldown: 2 * 1000,
			nOfParams: 2,
			description:
				"Moves tracks <from> <to> in the queue. Supports playing a track next when passed 1 parameter only.",
			exampleUsage: "<from> <to>\n4 5\n4",
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
		const voiceChannel = member.voice.channel;
		const textChannel = message.channel as TextChannel;
		const controller = this.client.controllers.get("music") as MusicController;

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
	};
}
