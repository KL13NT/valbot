import ValClient from "../ValClient";
import { MusicController } from "../controllers";
import { reply } from "../utils/general";
import { TextChannel } from "discord.js";
import Interaction from "../structures/Interaction";
import InteractionContext from "../structures/InteractionContext";
import { ApplicationCommandOptionType } from "discord-api-types/v10";
import { getVoiceConnection } from "@discordjs/voice";

export default class Move extends Interaction {
	constructor(client: ValClient) {
		super(client, {
			name: "move",
			category: "Music",
			cooldown: 2 * 1000,
			description:
				"Moves tracks <from> <to> in the queue. Supports playing a track next when passed 1 parameter only.",
			options: [
				{
					name: "from",
					description: "Position to move from",
					required: true,
					type: ApplicationCommandOptionType.Number,
				},
				{
					name: "to",
					description: "Position to move to",
					required: false,
					type: ApplicationCommandOptionType.Number,
				},
			],
			aliases: ["m"],
			auth: {
				method: "ROLE",
				required: "AUTH_EVERYONE",
			},
		});
	}

	_run = async ({
		member,
		interaction,
		channel,
		guild,
		params,
	}: InteractionContext) => {
		const voiceChannel = member.voice.channel;
		const textChannel = channel as TextChannel;
		const controller = this.client.controllers.get("music") as MusicController;
		const connection = getVoiceConnection(guild.id);

		if (!connection) {
			await reply("Bot.VoiceNotConnected", channel, null, interaction);
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

		const songIndex = params.getNumber("from") - 1;
		const newIndex = params.getNumber("to")
			? params.getNumber("to") - 1
			: controller.currentSongIndex + 1;

		if (isNaN(songIndex) || isNaN(newIndex)) {
			await reply("Command.Move.Invalid", textChannel, null, interaction);
			return;
		}

		const queueLength = controller.queue.length;

		if (
			songIndex === controller.currentSongIndex ||
			newIndex === controller.currentSongIndex
		) {
			await reply(
				"Command.Move.CurrentlyPlaying",
				textChannel,
				null,
				interaction,
			);
			return;
		}

		if (
			songIndex >= queueLength ||
			songIndex < 0 ||
			newIndex >= queueLength ||
			newIndex < 0
		) {
			await reply(
				"Command.Move.OutOfBoundaries",
				textChannel,
				null,
				interaction,
			);
			return;
		}

		const { title, url } = controller.queue[songIndex];

		await reply(
			"Command.Move.Moved",
			textChannel,
			{
				id: songIndex + 1,
				title,
				url,
				index: newIndex + 1,
			},
			interaction,
		);

		controller.move(songIndex, newIndex);
	};
}
