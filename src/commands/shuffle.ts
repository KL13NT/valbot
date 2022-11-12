import ValClient from "../ValClient";
import { MusicController } from "../controllers";
import { reply } from "../utils/general";
import { TextChannel } from "discord.js";
import InteractionContext from "../structures/InteractionContext";
import Interaction from "../structures/Interaction";
import { getVoiceConnection } from "@discordjs/voice";

export default class Shuffle extends Interaction {
	constructor(client: ValClient) {
		super(client, {
			name: "shuffle",
			category: "Music",
			cooldown: 2 * 1000,
			description: "Shuffles the queue and restores original order",
			options: [],
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

		controller.shuffleState
			? await reply(
					"Command.Shuffle.Unshuffled",
					textChannel,
					null,
					interaction,
			  )
			: await reply("Command.Shuffle.Shuffled", textChannel, null, interaction);

		controller.shuffle();
	};
}
