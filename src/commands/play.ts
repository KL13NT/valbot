import { CommandInteraction, TextChannel } from "discord.js";

import ValClient from "../ValClient";
import ResolveBehavior from "../entities/music/ResolveBehavior";

import { reply } from "../utils/general";
import { MusicController } from "../controllers";
import { ApplicationCommandOptionType } from "discord-api-types/v10";
import Interaction from "../structures/Interaction";
import InteractionContext from "../structures/InteractionContext";

export default class Play extends Interaction {
	playBehavior: ResolveBehavior;

	constructor(client: ValClient) {
		super(client, {
			name: "play",
			category: "Music",
			cooldown: 2000,
			options: [
				{
					name: "query",
					description:
						"Track url or search query. Leave empty to continue when paused.",
					type: ApplicationCommandOptionType.String,
					required: false,
				},
			],
			description:
				"Start or continue playing a song. Supports YouTube and Spotify.",
			aliases: ["p"],
			auth: {
				method: "ROLE",
				required: "AUTH_EVERYONE",
			},
		});

		this.playBehavior = new ResolveBehavior();
	}

	_run = async ({ member, interaction, params }: InteractionContext) => {
		const voiceChannel = member.voice.channel;
		const textChannel = interaction.channel as TextChannel;
		const controller = this.client.controllers.get("music") as MusicController;

		if (!voiceChannel) {
			await reply("User.VoiceNotConnected", textChannel);
			return;
		}

		if (!controller.canUserPlay(voiceChannel)) {
			await reply("Command.Play.NotAllowed", textChannel);
			return;
		}

		const query = params.getString("query");

		if (!query) {
			await this.resume(controller, textChannel, interaction);
			return;
		}

		const resolved = await this.resolve(query);

		if (!resolved) {
			await reply("Command.Play.GenericError", textChannel, null, interaction);
			return;
		}

		controller.enqueue(resolved, member.id);

		if (Array.isArray(resolved))
			await reply(
				"Command.Play.Playlist",
				textChannel,
				{
					number: resolved.length,
				},
				interaction,
			);
		else {
			const { title, url } = resolved;
			await reply(
				"Command.Play.Single",
				textChannel,
				{
					id: controller.queue.length,
					title,
					url,
					member,
				},
				interaction,
			);
		}

		await controller.connect(voiceChannel, textChannel);

		if (controller.playState === "paused") return;

		await controller.play();
	};

	resume = async (
		controller: MusicController,
		channel: TextChannel,
		interaction: CommandInteraction,
	) => {
		const current = controller.getCurrentSong();
		const state = controller.playState;

		if (state === "paused") {
			controller.resume();
			await reply("Command.Play.Resumed", channel, null, interaction);
			return;
		}

		if (current) {
			await reply("Command.Play.AlreadyPlaying", channel, null, interaction);
			return;
		}

		await reply("Command.Play.NotPaused", channel, null, interaction);
	};

	/**
	 * @throws
	 */
	resolve = async (query: string) => {
		return this.playBehavior.fetch(query);
	};
}
