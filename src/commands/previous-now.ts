import { getVoiceConnection } from "@discordjs/voice";
import { TextChannel } from "discord.js";
import { MusicController } from "../controllers";
import Interaction from "../structures/Interaction";
import InteractionContext from "../structures/InteractionContext";
import { reply } from "../utils/general";
import ValClient from "../ValClient";

export default class PreviousNow extends Interaction {
	constructor(client: ValClient) {
		super(client, {
			name: "previousNow",
			category: "Music",
			cooldown: 5 * 1000,
			description: "Jump to the previous track",
			options: [],
			aliases: ["prev"],
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

		const queueLength = controller.queue.length;

		if (queueLength === 0) {
			await reply("Music.EmptyQueue", textChannel, null, interaction);
			return;
		}

		const index = controller.currentSongIndex;

		if (index === 0 && controller.loopState !== "queue") {
			await reply(
				"Command.PreviousNow.NoPreviousSong",
				textChannel,
				null,
				interaction,
			);
			return;
		}

		if (index === 0 && controller.loopState === "queue") {
			const lastSongInTheQueueIndex = queueLength - 1;
			const { title, url } = controller.queue[lastSongInTheQueueIndex];

			await reply(
				"Command.PreviousNow.jumped",
				textChannel,
				{
					id: lastSongInTheQueueIndex + 1,
					title,
					url,
				},
				interaction,
			);

			await controller.jump(lastSongInTheQueueIndex);

			return;
		}

		const { title, url } = controller.queue[index - 1];

		await reply(
			"Command.PreviousNow.jumped",
			textChannel,
			{
				id: index,
				title,
				url,
			},
			interaction,
		);

		await controller.jump(index - 1);
	};
}
