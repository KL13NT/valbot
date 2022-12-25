import ValClient from "../ValClient";
import { Command, CommandContext } from "../structures";
import { MusicController } from "../controllers";
import { reply } from "../utils/general";
import { TextChannel } from "discord.js";
import { getVoiceConnections } from "@discordjs/voice";

export default class Remove extends Command {
	constructor(client: ValClient) {
		super(client, {
			name: "remove",
			category: "Music",
			cooldown: 2 * 1000,
			nOfParams: 1,
			description: "Removes a track from the queue",
			exampleUsage: "4",
			extraParams: false,
			optionalParams: 0,
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

		const connections = getVoiceConnections();

		if (connections.size === 0) {
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

		const index = Number(params[0]) - 1;

		if (isNaN(index)) {
			await reply("Command.Remove.Invalid", textChannel);
			return;
		}

		const queueLength = controller.queue.length;

		if (index >= queueLength || index < 0) {
			await reply("Command.Remove.OutOfBoundaries", textChannel, {
				id: index + 1,
			});
			return;
		}

		if (index === controller.currentSongIndex) {
			await reply("Command.Remove.CurrentlyPlaying", textChannel);
			return;
		}

		const { title, url } = controller.queue[index];

		await reply("Command.Remove.Removed", textChannel, {
			id: index + 1,
			title,
			url,
		});

		await controller.remove(index);
	};
}
