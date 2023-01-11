import { getVoiceConnections } from "@discordjs/voice";
import { TextChannel } from "discord.js";
import { MusicController } from "../controllers";
import Interaction from "../structures/Interaction";
import InteractionContext from "../structures/InteractionContext";
import { reply } from "../utils/general";
import ValClient from "../ValClient";

export default class Skip extends Interaction {
	constructor(client: ValClient) {
		super(client, {
			name: "skip",
			category: "Music",
			cooldown: 5 * 1000,
			options: [],
			description: "Skips the currently playing song",
			aliases: ["s"],
			auth: {
				method: "ROLE",
				required: "AUTH_EVERYONE",
			},
		});
	}

	_run = async ({ member, interaction }: InteractionContext) => {
		const textChannel = interaction.channel as TextChannel;
		const controller = this.client.controllers.get("music") as MusicController;
		const voiceChannel = member.voice.channel;

		if (!voiceChannel) {
			await reply("User.VoiceNotConnected", textChannel, null, interaction);
			return;
		}

		if (!controller.canUserPlay(voiceChannel)) {
			await reply("User.SameChannel", textChannel, null, interaction);
			return;
		}

		const connections = getVoiceConnections();

		if (connections.size === 0) {
			await reply("Bot.VoiceNotConnected", textChannel, null, interaction);
			return;
		}

		const song = controller.getCurrentSong();

		const response = song
			? {
					message: "Command.Skip.Skipped",
					params: {
						title: song.title,
						url: song.url,
					},
			  }
			: {
					message: "Music.EmptyQueue",
					params: {},
			  };

		await reply(response.message, textChannel, response.params, interaction);

		await controller.skip(true);
	};
}
