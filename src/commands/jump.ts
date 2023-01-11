import { getVoiceConnection } from "@discordjs/voice";
import { ApplicationCommandOptionType } from "discord-api-types/v10";
import { TextChannel } from "discord.js";
import { MusicController } from "../controllers";
import Interaction from "../structures/Interaction";
import InteractionContext from "../structures/InteractionContext";
import { reply } from "../utils/general";
import ValClient from "../ValClient";

export default class Jump extends Interaction {
	constructor(client: ValClient) {
		super(client, {
			name: "jump",
			category: "Music",
			cooldown: 5 * 1000,
			description: "Jump to a specific song in queue.",
			options: [
				{
					name: "position",
					description: "Number of song in the queue",
					required: true,
					type: ApplicationCommandOptionType.Number,
				},
			],
			aliases: ["j"],
			auth: {
				method: "ROLE",
				required: "AUTH_EVERYONE",
			},
		});
	}

	_run = async ({ member, guild, interaction, params }: InteractionContext) => {
		const voiceChannel = member.voice.channel;
		const textChannel = interaction.channel as TextChannel;
		const controller = this.client.controllers.get("music") as MusicController;
		const connection = getVoiceConnection(guild.id);

		if (!connection) {
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

		const index = params.getNumber("position") - 1;
		const queueLength = controller.queue.length;

		if (queueLength === 0) {
			await reply("Music.EmptyQueue", textChannel, null, interaction);
			return;
		}

		if (index >= queueLength || index < 0) {
			await reply(
				"Command.Jump.OutOfBoundaries",
				textChannel,
				{
					id: index + 1,
				},
				interaction,
			);
			return;
		}

		const { title, url } = controller.queue[index];

		await reply(
			"Command.Jump",
			textChannel,
			{
				id: index + 1,
				title,
				url,
			},
			interaction,
		);

		await controller.jump(index);
	};
}
