import { TextChannel } from "discord.js";
import { getVoiceConnections } from "@discordjs/voice";
import { ApplicationCommandOptionType } from "discord-api-types/v10";

import ValClient from "../ValClient";
import Interaction from "../structures/Interaction";
import InteractionContext from "../structures/InteractionContext";

import { MusicController } from "../controllers";
import { reply } from "../utils/general";

export default class Remove extends Interaction {
	constructor(client: ValClient) {
		super(client, {
			name: "remove",
			category: "Music",
			cooldown: 2 * 1000,
			options: [
				{
					name: "position",
					description: "position of the song to be removed",
					required: true,
					type: ApplicationCommandOptionType.Integer,
				},
			],
			description: "Removes a track from the queue",
			auth: {
				method: "ROLE",
				required: "AUTH_EVERYONE",
			},
		});
	}

	_run = async ({ member, interaction, params }: InteractionContext) => {
		const voiceChannel = member.voice.channel;
		const textChannel = interaction.channel as TextChannel;
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

		const index = params.getInteger("position") - 1;

		if (isNaN(index)) {
			await reply("Command.Remove.Invalid", textChannel, null, interaction);
			return;
		}

		const queueLength = controller.queue.length;

		if (index >= queueLength || index < 0) {
			await reply(
				"Command.Remove.OutOfBoundaries",
				textChannel,
				{
					id: index + 1,
				},
				interaction,
			);
			return;
		}

		if (index === controller.currentSongIndex) {
			await reply(
				"Command.Remove.CurrentlyPlaying",
				textChannel,
				null,
				interaction,
			);
			return;
		}

		const { title, url } = controller.queue[index];

		await reply(
			"Command.Remove.Removed",
			textChannel,
			{
				id: index + 1,
				title,
				url,
			},
			interaction,
		);

		await controller.remove(index);
	};
}
